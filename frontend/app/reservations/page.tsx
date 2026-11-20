import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { fetchMyReservationsApi } from "@/hooks/api/useReservations";
import { StudentReservationsView } from "@/components/modules/reservations/student-reservations-view";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Reservations & Active Holds",
  description: "View active online book reservations, expiration countdowns, and pickup instructions at the school library circulation desk.",
};

export default async function StudentReservationsPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const token = await getToken();
  let reservations: any[] = [];
  try {
    reservations = await fetchMyReservationsApi(token);
  } catch (error) {
    console.error("Failed to load student reservations:", error);
  }

  return <StudentReservationsView reservations={reservations} />;
}
