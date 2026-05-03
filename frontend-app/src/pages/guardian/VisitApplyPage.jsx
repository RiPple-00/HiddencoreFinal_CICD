import { useState } from "react";
import VisitReservationPage from "./visit/VisitReservationPage";
import VisitReservationCompletePage from "./visit/VisitReservationCompletePage";

export default function VisitApplyPage({ navigation }) {
  const [completedData, setCompletedData] = useState(null);

  if (completedData) {
    return (
      <VisitReservationCompletePage
        data={completedData}
        onHome={() => {
          setCompletedData(null);
          navigation.navigate("GuardianMain");
        }}
      />
    );
  }

  return (
    <VisitReservationPage
      onBack={() => navigation.goBack()}
      onComplete={(data) => setCompletedData(data)}
    />
  );
}