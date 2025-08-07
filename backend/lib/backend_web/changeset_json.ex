defmodule BackendWeb.ChangesetJSON do
  # Traverses and translates changeset errors.
  def error(%{changeset: changeset}) do
    %{errors: Ecto.Changeset.traverse_errors(changeset, &translate_error/1)}
  end

  defp translate_error({msg, opts}) do
    # You can make this smarter by returning I18n translations.
    # For now, we just interpolate the error message.
    Enum.reduce(opts, msg, fn {key, value}, acc ->
      String.replace(acc, "%{#{key}}", to_string(value))
    end)
  end
end