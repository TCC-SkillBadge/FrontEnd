import React from "react";
import { useParams } from "react-router-dom";
import BadgeDetails from "../components/BadgeDetails";

const BadgePublicDisplay = () => {
  const { id_badge, username_enterprise } = useParams();

  return (
    <div className="badge-details-page">
      <BadgeDetails
        id_badge={id_badge}
        username_enterprise={username_enterprise}
      />
    </div>
  );
};

export default BadgePublicDisplay;
