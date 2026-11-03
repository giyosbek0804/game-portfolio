import { create } from "zustand";
import { playOrderChime, playKitchenBell } from "@/utils/restaurantSound";
import { useGameStore } from "@/store/useGameStore";

export type OrderStatus =
  | "received"
  | "cooking"
  | "plating"
  | "ready"
  | "served"
  | "completed";

export interface RestaurantOrder {
  id: string;
  orderNumber: string; // e.g. "#101", "VIP-201"
  item: string;
  tableNumber: number; // 1, 2, 3 (or 0 for Kiosk)
  status: OrderStatus;
  isPlayerOrder: boolean;
  timeRemaining: number;
}

export type WaiterActionState =
  | "idle_counter"
  | "walking_to_table"
  | "taking_order"
  | "walking_to_kitchen"
  | "waiting_at_pass"
  | "delivering_food"
  | "placing_tray";

export interface TableCustomer {
  id: string;
  tableIndex: number; // 0: Table 1, 1: Table 2, 2: Table 3
  state: "seated_waiting" | "ordering" | "waiting_food" | "eating" | "leaving";
  hasFood: boolean;
  eatingProgress: number; // 0 to 1
  accentColor: string;
}

interface MenutopiaStore {
  // Order Queue & KDS Monitor
  orders: RestaurantOrder[];
  orderCounter: number;

  // Active Waiter Routine
  waiterState: WaiterActionState;
  waiterTargetTable: number; // 1, 2, 3
  waiterHasTray: boolean;
  waiterTimer: number;

  // Seated Table Customers
  customers: TableCustomer[];

  // Player Kiosk Order
  playerOrder: RestaurantOrder | null;
  placePlayerOrder: () => void;
  pickupPlayerOrder: () => void;

  // Chef state (cooking, plating)
  chefGrillFlipping: boolean;
  chefPlating: boolean;

  // Simulation tick
  tickSimulation: (delta: number) => void;
  setCustomerState: (tableIndex: number, state: TableCustomer["state"]) => void;
}

const INITIAL_CUSTOMERS: TableCustomer[] = [
  {
    id: "cust_1",
    tableIndex: 0,
    state: "seated_waiting",
    hasFood: false,
    eatingProgress: 0,
    accentColor: "#f97316", // Orange hoodie
  },
  {
    id: "cust_2",
    tableIndex: 1,
    state: "eating",
    hasFood: true,
    eatingProgress: 0.35,
    accentColor: "#38bdf8", // Sky blue shirt
  },
  {
    id: "cust_3",
    tableIndex: 2,
    state: "seated_waiting",
    hasFood: false,
    eatingProgress: 0,
    accentColor: "#a855f7", // Purple sweater
  },
];

const INITIAL_ORDERS: RestaurantOrder[] = [
  {
    id: "ord_101",
    orderNumber: "#101",
    item: "Double Smash Burger + Fries",
    tableNumber: 2,
    status: "served",
    isPlayerOrder: false,
    timeRemaining: 0,
  },
  {
    id: "ord_102",
    orderNumber: "#102",
    item: "Crispy Chicken Combo + Shake",
    tableNumber: 1,
    status: "cooking",
    isPlayerOrder: false,
    timeRemaining: 12,
  },
];

export const useMenutopiaStore = create<MenutopiaStore>((set, get) => ({
  orders: INITIAL_ORDERS,
  orderCounter: 103,

  waiterState: "walking_to_table",
  waiterTargetTable: 1,
  waiterHasTray: false,
  waiterTimer: 0,

  customers: INITIAL_CUSTOMERS,

  playerOrder: null,

  chefGrillFlipping: true,
  chefPlating: false,

  setCustomerState: (tableIndex, state) => {
    set({
      customers: get().customers.map((c) =>
        c.tableIndex === tableIndex ? { ...c, state } : c
      ),
    });
  },

  placePlayerOrder: () => {
    const current = get().playerOrder;
    if (current && current.status !== "served") return;

    playOrderChime();
    const newOrder: RestaurantOrder = {
      id: `ord_vip_${Date.now()}`,
      orderNumber: "VIP-#201",
      item: "Chef's Deluxe Gold Burger + Truffle Fries",
      tableNumber: 0,
      status: "received",
      isPlayerOrder: true,
      timeRemaining: 14,
    };

    set({
      playerOrder: newOrder,
      orders: [newOrder, ...get().orders.slice(0, 4)],
    });

    // Notify kitchen
    setTimeout(() => {
      set({
        orders: get().orders.map((o) =>
          o.id === newOrder.id ? { ...o, status: "cooking" } : o
        ),
      });
    }, 2000);
  },

  pickupPlayerOrder: () => {
    const { playerOrder } = get();
    if (!playerOrder || playerOrder.status !== "ready") return;

    playKitchenBell();
    const servedOrder: RestaurantOrder = {
      ...playerOrder,
      status: "served",
    };

    set({
      playerOrder: servedOrder,
      orders: get().orders.map((o) =>
        o.id === playerOrder.id ? servedOrder : o
      ),
    });

    // Reset player order after 20 seconds so player can order again
    setTimeout(() => {
      if (get().playerOrder?.id === playerOrder.id) {
        set({ playerOrder: null });
      }
    }, 20000);
  },

  tickSimulation: (delta: number) => {
    const playerZone = useGameStore.getState().playerZone;
    // PERFORMANCE SAFEGUARD: Throttle simulation when player is outside or in distant rooms
    if (playerZone !== "menutopia" && playerZone !== "museum") {
      return;
    }

    const {
      waiterState,
      waiterTimer,
      waiterTargetTable,
      customers,
      orders,
      orderCounter,
      playerOrder,
    } = get();

    // ─────────────────────────────────────────────────────────────
    // 1. UPDATE KITCHEN ORDERS COUNTDOWN
    // ─────────────────────────────────────────────────────────────
    const updatedOrders = orders.map((o) => {
      if (o.status === "cooking" || o.status === "plating") {
        const nextTime = Math.max(0, o.timeRemaining - delta);
        if (nextTime === 0 && o.status === "cooking") {
          playKitchenBell();
          return { ...o, status: "plating" as OrderStatus, timeRemaining: 4.5 };
        }
        if (nextTime === 0 && o.status === "plating") {
          return { ...o, status: "ready" as OrderStatus, timeRemaining: 0 };
        }
        return { ...o, timeRemaining: nextTime };
      }
      return o;
    });

    let updatedPlayerOrder = playerOrder;
    if (playerOrder) {
      const match = updatedOrders.find((o) => o.id === playerOrder.id);
      if (match) updatedPlayerOrder = match;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CUSTOMER EATING CYCLES
    // ─────────────────────────────────────────────────────────────
    const updatedCustomers = customers.map((c) => {
      if (c.state === "eating") {
        const nextProgress = c.eatingProgress + delta * 0.05; // ~20s eating duration
        if (nextProgress >= 1.0) {
          // Finished eating, customer leaves table
          return {
            ...c,
            state: "leaving" as const,
            hasFood: false,
            eatingProgress: 0,
          };
        }
        return { ...c, eatingProgress: nextProgress };
      }
      return c;
    });

    // Despawn leaving customer and seat a new arriving customer after 4s
    const leavingCustomer = updatedCustomers.find((c) => c.state === "leaving");
    if (leavingCustomer) {
      setTimeout(() => {
        const colors = ["#f97316", "#38bdf8", "#a855f7", "#ec4899", "#10b981"];
        const nextColor = colors[Math.floor(Math.random() * colors.length)];
        set({
          customers: get().customers.map((c) =>
            c.id === leavingCustomer.id
              ? {
                  ...c,
                  id: `cust_${Date.now()}`,
                  state: "seated_waiting" as const,
                  hasFood: false,
                  eatingProgress: 0,
                  accentColor: nextColor,
                }
              : c
          ),
        });
      }, 4000);
    }

    // ─────────────────────────────────────────────────────────────
    // 3. WAITER ROUTINE STATE MACHINE
    // ─────────────────────────────────────────────────────────────
    let nextWaiterState = waiterState;
    let nextTimer = waiterTimer + delta;
    let nextHasTray = get().waiterHasTray;
    let nextTargetTable = waiterTargetTable;

    if (waiterState === "taking_order") {
      // Waiter pauses at table tapping tablet for 2.2s
      if (nextTimer >= 2.2) {
        nextTimer = 0;
        playOrderChime();

        // Create new restaurant order from this table
        const newTicketNum = `#${orderCounter}`;
        const foodItems = [
          "Double Cheeseburger + Seasoned Fries",
          "Crispy Chicken Burger + Onion Rings",
          "Pepperoni Flatbread + Iced Tea",
          "Bacon BBQ Burger + Large Soda",
        ];
        const randomItem = foodItems[nextTargetTable % foodItems.length];
        const tableOrder: RestaurantOrder = {
          id: `ord_${Date.now()}`,
          orderNumber: newTicketNum,
          item: randomItem,
          tableNumber: nextTargetTable,
          status: "cooking",
          isPlayerOrder: false,
          timeRemaining: 10,
        };

        // Transition customer to "waiting_food"
        const nextCust = updatedCustomers.map((c) =>
          c.tableIndex === nextTargetTable - 1
            ? { ...c, state: "waiting_food" as const }
            : c
        );

        set({
          orderCounter: orderCounter + 1,
          orders: [tableOrder, ...updatedOrders.slice(0, 4)],
          customers: nextCust,
          waiterState: "walking_to_kitchen",
          waiterTimer: 0,
        });
        return;
      }
    } else if (waiterState === "waiting_at_pass") {
      // Waiter stands at kitchen plating pass to pick up ready food tray
      if (nextTimer >= 2.5) {
        nextTimer = 0;
        nextHasTray = true;
        nextWaiterState = "delivering_food";
      }
    } else if (waiterState === "placing_tray") {
      // Waiter places food tray on customer table (takes 1.2s)
      if (nextTimer >= 1.2) {
        nextTimer = 0;
        nextHasTray = false;
        // Customer begins eating!
        const nextCust = updatedCustomers.map((c) =>
          c.tableIndex === nextTargetTable - 1
            ? { ...c, state: "eating" as const, hasFood: true, eatingProgress: 0 }
            : c
        );

        // Find next table that needs an order taken
        const nextPending = nextCust.find((c) => c.state === "seated_waiting");
        if (nextPending) {
          nextTargetTable = nextPending.tableIndex + 1;
          nextWaiterState = "walking_to_table";
        } else {
          nextWaiterState = "idle_counter";
        }

        set({
          customers: nextCust,
          waiterState: nextWaiterState,
          waiterHasTray: false,
          waiterTargetTable: nextTargetTable,
          waiterTimer: 0,
        });
        return;
      }
    } else if (waiterState === "idle_counter") {
      // Check if any seated customer is waiting to order
      const pendingCustomer = updatedCustomers.find(
        (c) => c.state === "seated_waiting"
      );
      if (pendingCustomer && nextTimer >= 2.0) {
        nextTimer = 0;
        nextTargetTable = pendingCustomer.tableIndex + 1;
        nextWaiterState = "walking_to_table";
      }
    }

    set({
      orders: updatedOrders,
      playerOrder: updatedPlayerOrder,
      customers: updatedCustomers,
      waiterState: nextWaiterState,
      waiterTimer: nextTimer,
      waiterHasTray: nextHasTray,
      waiterTargetTable: nextTargetTable,
    });
  },
}));

