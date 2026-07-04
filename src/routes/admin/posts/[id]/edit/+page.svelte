<script lang="ts">
  import PostForm from "$lib/components/editor/post-form.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import Button from "$lib/components/ui/button.svelte";

  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const values = $derived({
    error: form && "error" in form ? form.error : undefined,
    title:
      form && "title" in form ? form.title : data.post.title,
    description:
      form && "description" in form
        ? form.description
        : data.post.description,
    tags: form && "tags" in form ? form.tags : data.post.tags,
    status:
      form && "status" in form ? form.status : data.post.status,
    contentJson:
      form && "contentJson" in form
        ? form.contentJson
        : data.post.contentJson,
  });
</script>

<PageTitle href="/admin/posts/{data.post.id}/edit">edit</PageTitle>

{#if form?.success}
  <p class="font-pixel text-primary mb-4 text-[8px] uppercase" role="status">
    Post saved.
  </p>
{/if}

<PostForm action="?/save" submitLabel="Save changes" {values} />

<form method="POST" action="?/delete" class="mt-4">
  <Button
    type="submit"
    variant="destructive"
    onclick={(e) => {
      if (!confirm("Delete this post permanently?")) {
        e.preventDefault();
      }
    }}
  >
    Delete post
  </Button>
</form>