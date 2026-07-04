<script lang="ts">
  import "../app.css";

  import { onMount } from "svelte";

  import { beforeNavigate, onNavigate } from "$app/navigation";
  import { updated } from "$app/state";
  import { getTransitionType } from "$lib/navigation/transitions";

  let { children } = $props();

  beforeNavigate(({ willUnload, to }) => {
    if (updated.current && !willUnload && to?.url) {
      location.href = to.url.href;
    }
  });

  onMount(() => {
    const refreshBuild = () => {
      void updated.check();
    };

    window.addEventListener("focus", refreshBuild);
    document.addEventListener("visibilitychange", refreshBuild);

    return () => {
      window.removeEventListener("focus", refreshBuild);
      document.removeEventListener("visibilitychange", refreshBuild);
    };
  });

  onNavigate((navigation) => {
    const startViewTransition = document.startViewTransition;
    if (!startViewTransition) {
      return;
    }

    const from =
      navigation.from?.url ?? new URL(navigation.to?.url ?? window.location.href);
    const to = navigation.to?.url;

    if (!to) {
      return;
    }

    const transitionType = getTransitionType(from, to);
    document.documentElement.dataset.transition = transitionType;

    return new Promise<void>((resolve) => {
      const transition = startViewTransition.call(document, async () => {
        resolve();
        await navigation.complete;
      });

      transition.finished.finally(() => {
        delete document.documentElement.dataset.transition;
      });
    });
  });
</script>

<div class="mx-auto w-full max-w-[720px] px-4">
  {@render children()}
</div>