import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { deleteContact } from "~/data.server";

export const action = async ({ params } : ActionFunctionArgs ) => {
  invariant(params.contactId, "Missing contactId param");
  await deleteContact(params.contactId);
  return redirect("/contacts")

}
