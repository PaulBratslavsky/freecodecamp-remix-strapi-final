import { useNavigate, useActionData, Form } from "@remix-run/react";
import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { createContact } from "~/data.server";
import z from "zod";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const formSchema = z.object({
    avatar: z.string().url().min(2),
    first: z.string().min(2),
    last: z.string().min(2),
    twitter: z.string().min(2),
  });

  const validatedFields = formSchema.safeParse({
    avatar: data.avatar,
    first: data.first,
    last: data.last,
    twitter: data.twitter,
  });

  if (!validatedFields.success) {
    return json({
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fill out all missing fields.",
      data: null,
    });
  }

  const newEntry = await createContact(data);
  
  return redirect("/contacts/" + newEntry.id)
}

export default function CreateContact() {
  const navigate = useNavigate();
  const formData = useActionData<typeof action>();

  return (
    <Form method="post">
      <div className="create-form-grid">
        <FormInput
          aria-label="First name"
          name="first"
          type="text"
          label="First name"
          placeholder="First"
          errors={formData?.errors}
        />
        <FormInput
          aria-label="Last name"
          name="last"
          type="text"
          label="Last name"
          placeholder="Last"
          errors={formData?.errors}
        />
        <FormInput
          name="twitter"
          type="text"
          label="Twitter"
          placeholder="@jack"
          errors={formData?.errors}
        />
        <FormInput
          aria-label="Avatar URL"
          name="avatar"
          type="text"
          label="Avatar URL"
          placeholder="https://example.com/avatar.jpg"
          errors={formData?.errors}
        />
      </div>
      <div>
        <label>
          <span>Notes</span>
          <textarea name="note" rows={6} />
        </label>
      </div>

      <div className="button-group">
        <button type="submit">Create</button>
        <button type="button" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </Form>
  );
}

function FormInput({
  type,
  name,
  label,
  placeholder,
  defaultValue = "",
  errors,
}: Readonly<{
  type: string;
  name: string;
  label?: string;
  placeholder?: string;
  errors: any;
  defaultValue?: string;
}>) {
  return (
    <div className="input-field">
      <div>
        <label htmlFor={name}>{label}</label>
        <div>
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            defaultValue={defaultValue}
          />
        </div>
      </div>
      <ul>
        {errors && errors[name]
          ? errors[name].map((error: string) => (
              <li key={error} className="input-error">
                {error}
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}
