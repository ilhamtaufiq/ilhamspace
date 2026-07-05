<script lang="ts">
  import { cn } from "$lib/utils";

  type Props = {
    page: number;
    totalPages: number;
    totalItems: number;
    buildUrl: (page: number) => string;
    label?: string;
    embedded?: boolean;
  };

  let {
    page,
    totalPages,
    totalItems,
    buildUrl,
    label = "List pages",
    embedded = false,
  }: Props = $props();

  const pageNumbers = $derived(
    Array.from({ length: totalPages }, (_, index) => index + 1),
  );
</script>

{#if totalPages > 1}
  <nav
    class={cn(
      "flex flex-wrap items-center justify-between gap-3",
      embedded ? "pt-0" : "mt-6 border-t-2 border-border pt-4",
    )}
    aria-label={label}
  >
    <p class="type-meta text-sm">
      Page {page} of {totalPages}
      <span class="text-muted-foreground">· {totalItems} total</span>
    </p>

    <div class="flex flex-wrap items-center gap-2">
      {#if page > 1}
        <a
          href={buildUrl(page - 1)}
          class="font-pixel border-2 border-border px-2 py-0.5 text-[8px] uppercase no-underline text-muted-foreground hover:border-accent hover:text-accent"
        >
          Prev
        </a>
      {/if}

      {#each pageNumbers as pageNumber (pageNumber)}
        <a
          href={buildUrl(pageNumber)}
          class="font-pixel border-2 px-2 py-0.5 text-[8px] uppercase no-underline {page ===
          pageNumber
            ? 'border-accent bg-accent/15 text-accent'
            : 'border-border text-muted-foreground hover:border-accent hover:text-accent'}"
          aria-current={page === pageNumber ? "page" : undefined}
        >
          {pageNumber}
        </a>
      {/each}

      {#if page < totalPages}
        <a
          href={buildUrl(page + 1)}
          class="font-pixel border-2 border-border px-2 py-0.5 text-[8px] uppercase no-underline text-muted-foreground hover:border-accent hover:text-accent"
        >
          Next
        </a>
      {/if}
    </div>
  </nav>
{/if}