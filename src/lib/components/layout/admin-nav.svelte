<script lang="ts">
  import { page } from "$app/stores";

  import Button from "$lib/components/ui/button.svelte";
  import { cn } from "$lib/utils";

  const primaryItems = [
    { text: "Dashboard", href: "/admin" },
    { text: "Posts", href: "/admin/posts" },
    { text: "Comments", href: "/admin/comments" },
    { text: "Projects", href: "/admin/projects" },
    { text: "Settings", href: "/admin/settings" },
  ] as const;

  const createItems = [
    { text: "New post", href: "/admin/posts/new" },
    { text: "New project", href: "/admin/projects/new" },
  ] as const;

  const isActive = (href: string, pathname: string): boolean => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
</script>

<header class="admin-nav pixel-border bg-card overflow-hidden">
  <div class="admin-nav__titlebar border-b-2 border-border px-4 py-2">
    <p class="type-caption text-primary-foreground">Admin / CMS</p>
  </div>

  <nav
    aria-label="Admin navigation"
    class="flex flex-col gap-3 p-3 sm:p-4"
  >
    <div class="flex flex-wrap gap-1.5">
      {#each primaryItems as item (item.href)}
        {@const active = isActive(item.href, $page.url.pathname)}
        <Button
          href={item.href}
          variant="ghost"
          size="sm"
          class={cn(active && "pixel-nav-active")}
          aria-current={active ? "page" : undefined}
        >
          {item.text}
        </Button>
      {/each}
    </div>

    <div
      class="flex flex-wrap items-center justify-between gap-2 border-t-2 border-border pt-3"
    >
      <div class="flex flex-wrap gap-1.5">
        {#each createItems as item (item.href)}
          {@const active = isActive(item.href, $page.url.pathname)}
          <Button
            href={item.href}
            variant="outline"
            size="sm"
            class={cn(active && "pixel-nav-active")}
            aria-current={active ? "page" : undefined}
          >
            {item.text}
          </Button>
        {/each}
      </div>

      <div class="flex flex-wrap gap-1.5">
        <Button href="/" variant="outline" size="sm">View site</Button>
        <form method="POST" action="/logout" class="inline-flex">
          <Button type="submit" variant="destructive" size="sm">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  </nav>
</header>

<style>
  .admin-nav__titlebar {
    background-color: var(--primary);
  }
</style>