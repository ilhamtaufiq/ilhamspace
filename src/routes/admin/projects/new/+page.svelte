<script lang="ts">
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import ProjectForm from "$lib/components/projects/project-form.svelte";

  import type { ActionData } from "./$types";

  let { form }: { form: ActionData } = $props();
</script>

<PageTitle href="/admin/projects/new">new project</PageTitle>

<ProjectForm
  action="?/save"
  submitLabel="Create project"
  values={{
    error: form && "error" in form ? form.error : undefined,
    title: form && "title" in form ? form.title : undefined,
    description: form && "description" in form ? form.description : undefined,
    url: form && "url" in form ? form.url : undefined,
    iconUrl: form && "iconUrl" in form ? form.iconUrl : undefined,
    language: form && "language" in form ? form.language : undefined,
    languageColor:
      form && "languageColor" in form ? form.languageColor : undefined,
    sortOrder: form && "sortOrder" in form ? form.sortOrder : undefined,
    status: form && "status" in form ? form.status : undefined,
  }}
/>