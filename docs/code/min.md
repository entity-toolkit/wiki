
```mermaid
flowchart LR
    A-->B[a + $$b$$]
    B-->D(text)
    class A cssClass
```
<!-- <script src=" https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js "></script>  -->
<style>
.myclass>rect {
  fill: #ff0000;
  stroke: #ffff00;
  stroke-width: 4px;
}
</style>

<div id="custom-merm"></div>



<script type="module">
  import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
  mermaid.initialize({ 
    startOnLoad: false, 
  });

  // render on document load
  document.addEventListener('DOMContentLoaded', async () => {
    const element = document.querySelector('#custom-merm');
    const graphDefinition = 'graph TB\na-->b';
    const { svg } = await mermaid.render('custom-merm', graphDefinition);
    element.innerHTML = svg;
  });

  // const drawDiagram = async function () {
  //   const element = document.querySelector('#custom-merm');
  //   const graphDefinition = 'graph TB\na-->b';
  //   const { svg } = await mermaid.render('custom-merm', graphDefinition);
  //   element.innerHTML = svg;
  // };

  // await drawDiagram();
</script>