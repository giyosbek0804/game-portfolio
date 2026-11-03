import { create } from "zustand";
import { playClinicChime } from "@/utils/clinicSound";

export type ClinicDoctorStatus = "consulting" | "calling" | "break" | "idle";
export type PatientState =
  | "entering_clinic"
  | "at_kiosk"
  | "walking_to_chair"
  | "waiting_chair"
  | "walking_to_doctor"
  | "in_consultation"
  | "receiving_prescription"
  | "leaving_clinic"
  | "exited";

export interface PatientEntity {
  id: string;
  name: string;
  ticket: string;
  accentColor: string;
  state: PatientState;
  chairIndex: number; // 0, 1, 2, 3
  hasPrescription: boolean;
}

interface ClinicQueueStore {
  // Current doctor & consultation state
  currentTicket: string;
  doctorStatus: ClinicDoctorStatus;
  doctorDoorOpen: boolean;
  setDoctorDoorOpen: (open: boolean) => void;
  statusText: string;

  // Active patients in clinic
  patients: PatientEntity[];
  activePatientId: string | null;
  setPatientState: (id: string, state: PatientState) => void;

  // Next ticket counter
  ticketSequence: number;

  // Consultation countdown & timing
  consultationRemaining: number;
  consultationTotal: number;

  // User VIP Golden Ticket system
  userTicket: string | null;
  userTicketStatus: "none" | "waiting" | "called" | "entered";
  isUserTurn: boolean;
  takeUserTicket: () => void;
  setUserEnteredOffice: () => void;

  // Simulation tick (called every frame)
  tickSimulation: (delta: number) => void;
  callNextPatient: () => void;
  handPrescription: () => void;
  completeConsultation: () => void;
}

const INITIAL_PATIENTS: PatientEntity[] = [
  {
    id: "p1",
    name: "Patient 1",
    ticket: "A-01",
    accentColor: "#38bdf8",
    state: "in_consultation",
    chairIndex: -1,
    hasPrescription: false,
  },
  {
    id: "p2",
    name: "Patient 2",
    ticket: "A-02",
    accentColor: "#f472b6",
    state: "waiting_chair",
    chairIndex: 0,
    hasPrescription: false,
  },
  {
    id: "p3",
    name: "Patient 3",
    ticket: "A-03",
    accentColor: "#fbbf24",
    state: "waiting_chair",
    chairIndex: 1,
    hasPrescription: false,
  },
  {
    id: "p4",
    name: "Patient 4",
    ticket: "A-04",
    accentColor: "#a78bfa",
    state: "entering_clinic", // Spawns walking in through entrance to kiosk!
    chairIndex: 2,
    hasPrescription: false,
  },
];

export const useClinicQueueStore = create<ClinicQueueStore>((set, get) => ({
  currentTicket: "A-01",
  doctorStatus: "consulting",
  doctorDoorOpen: false,
  statusText: "IN CONSULTATION",

  patients: INITIAL_PATIENTS,
  activePatientId: "p1",
  ticketSequence: 5,

  consultationRemaining: 12,
  consultationTotal: 12,

  userTicket: null,
  userTicketStatus: "none",
  isUserTurn: false,

  setDoctorDoorOpen: (doctorDoorOpen) => set({ doctorDoorOpen }),

  setPatientState: (id, state) => {
    set({
      patients: get().patients.map((p) =>
        p.id === id ? { ...p, state } : p
      ),
    });
  },

  takeUserTicket: () => {
    const current = get().userTicket;
    if (current) return; // already has ticket

    playClinicChime();
    set({
      userTicket: "VIP-01",
      userTicketStatus: "waiting",
    });
  },

  setUserEnteredOffice: () => {
    const { isUserTurn } = get();
    // When user enters office, give full 10-second consultation session
    set({
      userTicketStatus: "entered",
      doctorStatus: "consulting",
      statusText: "IN CONSULTATION (VIP)",
      consultationRemaining: isUserTurn ? 10 : get().consultationRemaining,
      consultationTotal: 10,
    });
  },

  handPrescription: () => {
    const { activePatientId, patients } = get();
    if (!activePatientId) return;

    set({
      patients: patients.map((p) =>
        p.id === activePatientId
          ? { ...p, state: "receiving_prescription", hasPrescription: true }
          : p
      ),
    });
  },

  completeConsultation: () => {
    const { activePatientId, patients, isUserTurn } = get();

    // 1. If user was in consultation, 10s is up: doctor invites next patient!
    if (isUserTurn) {
      set({
        isUserTurn: false,
        userTicketStatus: "entered", // User remains in office without being kicked out
        doctorDoorOpen: true,
        statusText: "CALLING NEXT",
      });

      // Call next patient after 1.5s
      setTimeout(() => {
        get().callNextPatient();
      }, 1500);
      return;
    }

    // 2. If dummy patient was in consultation
    if (activePatientId) {
      // Mark current patient as leaving
      set({
        doctorDoorOpen: true,
        patients: patients.map((p) =>
          p.id === activePatientId ? { ...p, state: "leaving_clinic" } : p
        ),
      });

      // Despawn this patient from the store after they walk into museum (4.5s)
      setTimeout(() => {
        set({
          patients: get().patients.filter((p) => p.id !== activePatientId),
        });
      }, 4500);

      // Call next patient after 2.8 seconds
      setTimeout(() => {
        get().callNextPatient();
      }, 2800);
    } else {
      get().callNextPatient();
    }
  },

  callNextPatient: () => {
    const {
      userTicket,
      userTicketStatus,
      patients,
    } = get();

    playClinicChime();

    // 1. Check if User has a pending VIP ticket (PRIORITY QUEUE!)
    if (userTicket && userTicketStatus === "waiting") {
      set({
        currentTicket: "VIP-01",
        doctorStatus: "calling",
        doctorDoorOpen: true,
        statusText: "NOW CALLING: VIP-01 (VIP)",
        isUserTurn: true,
        userTicketStatus: "called",
        activePatientId: null,
        consultationRemaining: 10,
        consultationTotal: 10,
      });

      // Transition to consultation after 2.5s (runs 10s timer even if user stands at door)
      setTimeout(() => {
        const state = get();
        if (state.isUserTurn && state.doctorStatus === "calling") {
          set({
            doctorStatus: "consulting",
            statusText: "IN CONSULTATION (VIP)",
          });
        }
      }, 2500);
      return;
    }

    // 2. Otherwise pick next waiting dummy patient who is already seated with a ticket
    const waitingPatient = patients.find((p) => p.state === "waiting_chair");

    if (waitingPatient) {
      // Natural duration between 12 and 22 seconds
      const randomDuration = Math.floor(Math.random() * 11) + 12;

      set({
        currentTicket: waitingPatient.ticket,
        doctorStatus: "calling",
        doctorDoorOpen: true,
        statusText: `NOW CALLING: ${waitingPatient.ticket}`,
        activePatientId: waitingPatient.id,
        isUserTurn: false,
        consultationRemaining: randomDuration,
        consultationTotal: randomDuration,
        patients: patients.map((p) =>
          p.id === waitingPatient.id
            ? { ...p, state: "walking_to_doctor" }
            : p
        ),
      });

      // After walking inside (~2.5s), close door and start consultation
      setTimeout(() => {
        const state = get();
        if (state.activePatientId === waitingPatient.id) {
          set({
            doctorStatus: "consulting",
            doctorDoorOpen: false,
            statusText: "IN CONSULTATION",
            patients: state.patients.map((p) =>
              p.id === waitingPatient.id
                ? { ...p, state: "in_consultation" }
                : p
            ),
          });
        }
      }, 2500);

      // When this patient leaves chair, spawn a new incoming patient after 3.8s
      const freeChairIndex = waitingPatient.chairIndex;
      setTimeout(() => {
        const nextNum = get().ticketSequence;
        const newTicket = `A-0${nextNum}`;
        const newPatient: PatientEntity = {
          id: `p_${Date.now()}`,
          name: `Patient ${nextNum}`,
          ticket: newTicket,
          accentColor: ["#38bdf8", "#34d399", "#f472b6", "#a78bfa"][
            nextNum % 4
          ],
          state: "entering_clinic", // Patient walks in from entrance, goes to kiosk, then chair!
          chairIndex: freeChairIndex,
          hasPrescription: false,
        };

        set({
          ticketSequence: nextNum + 1,
          patients: [
            ...get().patients.filter(
              (p) => p.state !== "leaving_clinic" && p.state !== "exited"
            ),
            newPatient,
          ],
        });
      }, 3800);
    } else {
      // Brief clinic pause when all chairs are temporarily empty
      set({
        doctorStatus: "break",
        statusText: "SHORT BREAK",
        doctorDoorOpen: false,
      });
      setTimeout(() => {
        get().callNextPatient();
      }, 4500);
    }
  },

  tickSimulation: (delta: number) => {
    const { doctorStatus, consultationRemaining, isUserTurn } = get();

    if (doctorStatus !== "consulting") return;

    if (consultationRemaining > 0) {
      const nextRemaining = Math.max(0, consultationRemaining - delta);
      set({ consultationRemaining: nextRemaining });

      // When 2.5s remain in appointment, doctor hands prescription slip to dummy patient
      if (nextRemaining <= 2.5 && nextRemaining > 0 && !isUserTurn) {
        get().handPrescription();
      }

      // When countdown reaches 0: complete consultation!
      if (nextRemaining === 0) {
        get().completeConsultation();
      }
    }
  },
}));
