/**
 * Represents the input fields required to reserve a POAP via email.
 */
export interface EmailReservationInput {
  mintCode: string;
  email: string;
  sendEmail?: boolean;
}
