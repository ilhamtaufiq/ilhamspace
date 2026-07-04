<script lang="ts">
  import { IconMoon, IconSun } from "@tabler/icons-svelte";
  import { onMount } from "svelte";

  import RocketLogo from "$lib/components/brand/rocket-logo.svelte";
  import Button from "$lib/components/ui/button.svelte";
  import Menu from "$lib/components/layout/menu.svelte";
  import { siteConfig } from "$lib/config/site";
  import { toggleTheme } from "$lib/theme";
  import { cn } from "$lib/utils";

  let isScrolled = $state(false);

  onMount(() => {
    const handleScroll = (): void => {
      isScrolled = window.scrollY > 10;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  });
</script>

<div
  class={cn(
    "chrome-header sticky top-0 z-50 w-full bg-background",
    isScrolled && "pixel-border-b",
  )}
>
  <header class="mt-2 flex w-full items-center justify-between py-4">
    <div class="flex items-center gap-3">
      <a
        href="/"
        class="hover:text-accent flex shrink-0 items-center gap-2.5 no-underline"
        aria-label={siteConfig.name}
      >
        <span
          class="pixel-border bg-accent text-accent-foreground flex size-8 items-center justify-center"
        >
          <RocketLogo size={18} />
        </span>
        <span class="font-pixel hidden text-[10px] uppercase sm:inline sm:text-xs">
          {siteConfig.name}
        </span>
      </a>
      <span class="bg-border h-7 w-0.5" aria-hidden="true"></span>
      <Menu />
    </div>

    <Button
      variant="ghost"
      size="icon"
      onclick={toggleTheme}
      aria-label="Toggle theme"
    >
      <IconMoon size={16} class="hidden dark:block" aria-hidden="true" />
      <IconSun size={16} class="block dark:hidden" aria-hidden="true" />
    </Button>
  </header>
</div>