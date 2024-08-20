import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import {
  fetchDetailEvents,
  queryClient,
  updateNewEvents,
} from "../../Utils/https.jsx";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchDetailEvents({ id: id, signal: signal }),
  });

  const {
    mutate
  } = useMutation({
    mutationFn: updateNewEvents,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["events", id] });
      const prevEvent = queryClient.getQueryData({ queryKey: ["events", id] });
      queryClient.setQueryData(["events", id], data.event);
      return { prevEvent };
    },
    onError: (error, data, context) => {
      queryClient.setQueryData(["events", id], context.prevEvent);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", id],
      });
      // navigate("/events");
    },
  });

  function handleSubmit(formData) {
    mutate({ id: id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;
  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
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
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }
  return <Modal onClose={handleClose}>{content}</Modal>;
}
