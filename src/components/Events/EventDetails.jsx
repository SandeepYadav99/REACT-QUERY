import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  deleteEvents,
  fetchDetailEvents,
  queryClient,
} from "../../Utils/https.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import Modal from "../UI/Modal.jsx";
import { useState } from "react";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDelete, setIsDelete] = useState();
  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchDetailEvents({ id: id, signal }),
  });

  const {
    mutate,
    isPending: isDeletionPending,
    isError: isErrorPending,
    error: isErrorMessage,
  } = useMutation({
    mutationFn: deleteEvents,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  const deleteHandler = () => {
    mutate({ id: id });
  };

  const startDeleteHandler = () => {
    setIsDelete(true);
  };
  const closeHandler = () => {
    setIsDelete(false);
  };
  let content;

  if (isPending) {
    content = <p>Please enter a search term and to find events.</p>;
  }

  if (isError) {
    content = (
      <ErrorBlock
        title="An error occurred"
        message={error || "Failed to fetch event"}
      />
    );
  }

  if (data) {
    content = (
      <div id="event-details-content">
        <img src={`http://localhost:3000/${data?.image}`} alt="" />
        <div id="event-details-info">
          <div>
            <p id="event-details-location">{data?.location}</p>
            <time dateTime={`Todo-DateT$Todo-Time`}>
              {data?.date} @ {data?.time}
            </time>
          </div>
          <p id="event-details-description">{data?.description}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isDelete && (
        <Modal>
          <h2>Are your sure ?</h2>
          <p>
            Do you really want to delete this event ? This action cannot be
            undone.
          </p>
          <div className="form-actions">
            {isDeletionPending && <p>Loading....</p>}
            {!isDeletionPending && (
              <>
                <button onClick={closeHandler} className="button-text">
                  Cancel
                </button>
                <button onClick={deleteHandler} className="button">
                  Ok
                </button>
              </>
            )}
          </div>
          {isErrorPending && (
            <ErrorBlock
              title={"Failed to load event"}
              message={isErrorMessage.info?.message || "Failed to load "}
            />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>

      <article id="event-details">
        <header>
          <h1>{data?.title} </h1>
          <nav>
            <button onClick={startDeleteHandler}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        {content}
      </article>
    </>
  );
}
