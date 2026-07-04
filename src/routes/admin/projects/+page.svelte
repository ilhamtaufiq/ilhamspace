<script lang="ts">
  import PageTitle from "$lib/components/layout/page-title.svelte";
  import Button from "$lib/components/ui/button.svelte";

  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const formatDate = (date: Date | null): string => {
    if (!date) {
      return "—";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
</script>

<PageTitle href="/admin/projects">projects</PageTitle>

<div class="mb-4 flex justify-end">
  <Button href="/admin/projects/new">New project</Button>
</div>

{#if data.projects.length === 0}
  <div class="pixel-border bg-muted/40 p-6 text-center">
    <p class="font-pixel text-[10px] uppercase">No projects yet</p>
    <p class="font-retro text-muted-foreground mt-2 text-base">
      Add portfolio items from the admin panel.
    </p>
  </div>
{:else}
  <ul class="space-y-3">
    {#each data.projects as project (project.id)}
      <li class="pixel-border bg-card p-4">
        <div
          class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="min-w-0 space-y-1">
            <a
              href="/admin/projects/{project.id}/edit"
              class="font-retro text-lg font-medium hover:underline"
            >
              {project.title}
            </a>
            <p class="font-pixel text-muted-foreground text-[8px] uppercase">
              {project.status} · order {project.sortOrder} · {formatDate(
                project.updatedAt,
              )}
            </p>
            {#if project.description}
              <p class="font-retro text-muted-foreground truncate text-sm">
                {project.description}
              </p>
            {/if}
          </div>
          <div class="flex shrink-0 gap-2">
            <Button
              href="/admin/projects/{project.id}/edit"
              size="sm"
              variant="outline"
            >
              Edit
            </Button>
            <form method="POST" action="?/delete">
              <input type="hidden" name="id" value={project.id} />
              <Button
                type="submit"
                size="sm"
                variant="destructive"
                onclick={(e) => {
                  if (!confirm("Delete this project?")) {
                    e.preventDefault();
                  }
                }}
              >
                Delete
              </Button>
            </form>
          </div>
        </div>
      </li>
    {/each}
  </ul>
{/if}