import {
  Form,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
  useFetcher,
} from "@remix-run/react";
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import type { FunctionComponent } from "react";

import type { ContactRecord } from "../data.server";

import { getContact, updateContactById } from "../data.server";

export async function loader({ params }: LoaderFunctionArgs) {
  invariant(params.contactId, "Missing contactId param");
  const contactId = params.contactId;
  const contact = await getContact(contactId);
  if (!contact) throw new Response("Not Found", { status: 404 });
  return json(contact);
}

export async function action({ params, request} : ActionFunctionArgs ) {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  return updateContactById(params.contactId, {
    favorite: formData.get("favorite") === "true"
  })
}

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  return (
    <div className="contact-error">
      <h1>Your contact has left the building.</h1>
      <p>
        {isRouteErrorResponse(error)
          ? `${error.status} ${error.statusText}`
          : error instanceof Error
          ? error.message
          : "Unknown Error"}
      </p>
      <div>
        <button onClick={() => navigate(-1)}>Back to safety</button>
      </div>
    </div>
  );
}

export default function Contact() {
  const contact = useLoaderData<typeof loader>();

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>

      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}{" "}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}

        {contact.notes ? <p>{contact.notes}</p> : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="delete"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

const Favorite: FunctionComponent<{
  contact: Pick<ContactRecord, "favorite">;
}> = ({ contact }) => {
  const favorite = contact.favorite;
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post">
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </fetcher.Form>
  );
};
