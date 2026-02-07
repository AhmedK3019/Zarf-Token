import React from "react";
import { useParams } from "react-router-dom";
import EditTrip from "../tripPages/editTrip";
import EditBazaar from "../bazaarPages/EditBazaar";
import EditConference from "../conferencePages/EditConference";

export default function EditEvent() {
  const { type, id } = useParams();

  const renderEditComponent = () => {
    switch (type.toLowerCase()) {
      case "trip":
        return <EditTrip id={id} />;
      case "bazaar":
        return <EditBazaar id={id} />;
      case "conference":
        return <EditConference id={id} />;
      default:
        return <p>Unknown event type: {type}</p>;
    }
  };

  return <div className="p-6">{renderEditComponent()}</div>;
}
