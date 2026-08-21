import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getStudentReservations } from "@/lib/services/reservation-service";
import { StudentReservationsView } from "@/components/modules/reservations/student-reservations-view";

export const metadata = {
  title: "My Reservations & Active Holds",
  description: "View active online book reservations, expiration countdowns, and pickup instructions at the school library circulation desk.",
};

export default async function StudentReservationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const reservations = await getStudentReservations(userId);

  return <StudentReservationsView reservations={reservations} />;
}
