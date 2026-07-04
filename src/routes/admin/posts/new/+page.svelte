<script lang="ts">
  import PostForm from "$lib/components/editor/post-form.svelte";
  import PageTitle from "$lib/components/layout/page-title.svelte";

  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
</script>

<PageTitle href="/admin/posts/new">new post</PageTitle>

<PostForm
  action="?/save"
  submitLabel="Create post"
  values={{
    error: form && "error" in form ? form.error : undefined,
    title: form && "title" in form ? form.title : undefined,
    description: form && "description" in form ? form.description : undefined,
    tags: form && "tags" in form ? form.tags : undefined,
    status: form && "status" in form ? form.status : undefined,
    contentJson: form && "contentJson" in form ? form.contentJson : undefined,
  }}
/>