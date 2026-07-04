<script lang="ts">
  type Props = {
    scriptUrl: string;
    websiteId: string;
  };

  let { scriptUrl, websiteId }: Props = $props();
</script>

<svelte:head>
  <script async defer src={scriptUrl} data-website-id={websiteId}></script>
</svelte:head>