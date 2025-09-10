defmodule BackendWeb.Admin.UserXML do
  @moduledoc """
  Module for exporting user data to XML format.
  """
  alias Backend.Accounts.User
  alias XmlBuilder

  def export(%{users: users}) do
    # 1. Generate the XML for the root <users> element and its children.
    users_element = XmlBuilder.element(:users, Enum.map(users, &user_element/1))
    xml_body = XmlBuilder.generate(users_element, format: :pretty)

    # 2. Manually prepend the standard XML declaration to the generated string.
    ~s(<?xml version="1.0" encoding="UTF-8"?>\n) <> xml_body
  end

  defp user_element(%User{} = user) do
    profile_children =
      Enum.filter(
        [
          element_if_present(:name, user.name),
          element_if_present(:surname, user.surname),
          element_if_present(:email, user.email),
          element_if_present(:phone_number, user.phone_number),
          element_if_present(:photo_url, user.photo_url),
          element_if_present(:location, user.location),
          element_if_present(:role, user.role),
          element_if_present(:status, user.status),
          element_if_present(:onboarding_completed, user.onboarding_completed),
          element_if_present(:email_confirmed_at, user.email_confirmed_at),
          element_if_present(:last_seen_at, user.last_seen_at)
        ],
        & &1
      )

    posts_children =
      Enum.map(user.posts || [], &post_element/1)

    job_children =
      Enum.map(user.job_postings || [], &job_element/1)

    XmlBuilder.element(:user, [id: to_string(user.id)], [
      XmlBuilder.element(:profile, profile_children),
      XmlBuilder.element(:posts, posts_children),
      XmlBuilder.element(:job_postings, job_children)
    ])
  end

  defp post_element(post) do
    comments_children =
      Enum.map(post.comments || [], &comment_element/1)

    reactions_children =
      Enum.map(post.reactions || [], &reaction_element/1)

    XmlBuilder.element(
      :post,
      [id: to_string(post.id)],
      Enum.filter(
        [
          element_if_present(:content, post.content),
          element_if_present(:image_url, post.image_url),
          element_if_present(:link_url, post.link_url),
          element_if_present(:inserted_at, post.inserted_at),
          XmlBuilder.element(:comments, comments_children),
          XmlBuilder.element(:reactions, reactions_children)
        ],
        & &1
      )
    )
  end

  defp comment_element(comment) do
    XmlBuilder.element(
      :comment,
      [id: to_string(comment.id), user_id: to_string(comment.user_id)],
      Enum.filter(
        [
          element_if_present(:content, comment.content),
          element_if_present(:inserted_at, comment.inserted_at)
        ],
        & &1
      )
    )
  end

  defp reaction_element(reaction) do
    XmlBuilder.element(
      :reaction,
      [id: to_string(reaction.id), user_id: to_string(reaction.user_id)],
      Enum.filter(
        [
          element_if_present(:type, reaction.type)
        ],
        & &1
      )
    )
  end

  defp job_element(job) do
    XmlBuilder.element(
      :job_posting,
      [id: to_string(job.id)],
      Enum.filter(
        [
          element_if_present(:title, job.title),
          element_if_present(:description, job.description),
          element_if_present(:location, job.location),
          element_if_present(:job_type, job.job_type),
          element_if_present(:inserted_at, job.inserted_at)
        ],
        & &1
      )
    )
  end

  defp element_if_present(_tag, nil), do: nil
  defp element_if_present(tag, content), do: XmlBuilder.element(tag, to_string(content))
end
