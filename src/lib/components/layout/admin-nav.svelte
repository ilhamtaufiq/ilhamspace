<script lang="ts">
  import { page } from "$app/stores";

  import Button from "$lib/components/ui/button.svelte";
  import { cn } from "$lib/utils";

  const navItems = [
    { text: "Dashboard", href: "/admin" },
    { text: "Posts", href: "/admin/posts" },
    { text: "New post", href: "/admin/posts/new" },
    { text: "Comments", href: "/admin/comments" },
    { text: "Settings", href: "/admin/settings" },
    { text: "Projects", href: "/admin/projects" },
    { text: "New project", href: "/admin/projects/new" },
  ] as const;

  const isActive = (href: string, pathname: string): boolean => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
</script>

<nav
  aria-label="Admin navigation"
  class="pixel-border bg-card flex flex-wrap gap-1.5 p-2"
>
  {#each navItems as item (item.href)}
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

  <span class="bg-border mx-1 hidden h-6 w-0.5 sm:inline" aria-hidden="true"
  ></span>

  <Button href="/" variant="outline" size="sm">View site</Button>

  <form method="POST" action="/logout" class="inline-flex">
    <Button type="submit" variant="destructive" size="sm">Sign out</Button>
  </form>
</nav>