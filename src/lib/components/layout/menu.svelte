<script lang="ts">
  import { page } from "$app/stores";

  import Button from "$lib/components/ui/button.svelte";
  import { cn } from "$lib/utils";

  const menuItems = [
    { text: "Home", href: "/" },
    { text: "Notes", href: "/notes" },
    { text: "Projects", href: "/projects" },
  ] as const;

  const isActive = (href: string, pathname: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };
</script>

<nav aria-label="Main navigation" class="flex items-center gap-1.5 sm:gap-2">
  {#each menuItems as item (item.href)}
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
</nav>