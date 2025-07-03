// document.addEventListener("DOMContentLoaded", () => {
//   const table = document.getElementById("input-table");
//   if (!table) {
//     console.error("Input table not found");
//   } else {
//     const close_children = (element, closing) => {
//       const element_id = element.getAttribute("data-row-id");
//       if (closing) {
//         element.classList.remove("expanded");
//       } else {
//         element.classList.add("expanded");
//       }
//       Array.from(
//         table.querySelectorAll(`tr[data-parent-id="${element_id}"]`)
//       ).forEach((child_row) => {
//         if (closing) {
//           child_row.classList.add("collapsed-row");
//         } else {
//           child_row.classList.remove("collapsed-row");
//         }
//         if (closing && child_row.hasAttribute("data-toggle")) {
//           close_children(child_row, closing);
//         }
//       });
//     };

//     Array.from(table.querySelectorAll("tr[data-toggle='collapse']")).forEach(
//       (row) => {
//         row.addEventListener("click", () => {
//           if (row.classList.contains("expanded")) {
//             close_children(row, true);
//           } else {
//             close_children(row, false);
//           }
//         });
//       }
//     );
//   }
// });
