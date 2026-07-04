<script lang="ts">
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import ProjectForm from "$lib/components/projects/project-form.svelte";
  import Button from "$lib/components/ui/button.svelte";

  import type { ActionData, PageData } from "./$types";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  const values = $derived({
    error: form && "error" in form ? form.error : undefined,
    title: form && "title" in form ? form.title : data.project.title,
    description:
      form && "description" in form
        ? form.description
        : data.project.description,
    url: form && "url" in form ? form.url : data.project.url,
    iconUrl: form && "iconUrl" in form ? form.iconUrl : data.project.iconUrl,
    language:
      form && "language" in form ? form.language : data.project.language,
    languageColor:
      form && "languageColor" in form
        ? form.languageColor
        : data.project.languageColor,
    sortOrder:
      form && "sortOrder" in form ? form.sortOrder : data.project.sortOrder,
    status: form && "status" in form ? form.status : data.project.status,
  });
</script>

<PageTitle href="/admin/projects/{data.project.id}/edit">edit</PageTitle>

{#if form?.success}
  <p class="font-pixel text-primary mb-4 text-[8px] uppercase" role="status">
    Project saved.
  </p>
{/if}

<ProjectForm action="?/save" submitLabel="Save changes" {values} />

<form method="POST" action="?/delete" class="mt-4">
  <Button
    type="submit"
    variant="destructive"
    onclick={(e) => {
      if (!confirm("Delete this project permanently?")) {
        e.preventDefault();
      }
    }}
  >
    Delete project
  </Button>
</form>