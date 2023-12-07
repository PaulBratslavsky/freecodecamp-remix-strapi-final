import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { getContact, updateContactById } from "../data.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const contact = await getContact(params.contactId);
  if (!contact) throw new Response("Not Found", { status: 404 });
  return json({ contact });
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  console.log(data, "form data to update with");

  const updateResponse = await updateContactById(params.contactId, data);

  console.log(updateResponse, "what is going on here");

  if (updateResponse.error)
    return json({
      data: null,
      error: updateResponse.error,
    });

  return redirect("/contacts/" + params.contactId);
};

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();
  return (
    <div>
      <h1>Something happened when updating your information.</h1>
      <span>
        {isRouteErrorResponse(error)
          ? `${error.status} ${error.statusText}`
          : error instanceof Error
          ? error.message
          : "Unknown Error"}
      </span>
      <div className="button-margin">
        <button onClick={() => navigate(-1)}>Back to safety</button>
      </div>
    </div>
  );
}

export default function EditContact() {
  const { contact } = useLoaderData<typeof loader>();
  const formResponse = useActionData<typeof action>();
  const navigate = useNavigate();

  console.log(formResponse, "from action");

  return (
    <Form id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          defaultValue={contact.first}
          aria-label="First name"
          name="first"
          type="text"
          placeholder="First"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>
      <label>
        <span>Notes</span>
        <textarea defaultValue={contact.notes} name="notes" rows={6} />
      </label>
      <p>
        <button type="submit">Save</button>
        <button type="button" onClick={() => navigate}>
          Cancel
        </button>
      </p>
    </Form>
  );
}
