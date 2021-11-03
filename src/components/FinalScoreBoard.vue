<template>
  <div class="submission-form">
    <table id="finalleaderboard" class="display" style="width: 50%">
      <thead>
        <tr>
          <th>Team Name</th>
          <th>Waldo Score</th>
          <th>Waldo Ranked</th>
          <th>Movie Scores</th>
          <th>Movie Ranked</th>
          <th>Race Scores</th>
          <th>Race Ranked</th>
          <th>IQ Score</th>
          <!-- <th>IQ Ranked</th> -->
          <th>Total Score</th>
        </tr>
      </thead>
    </table>
  </div>
</template>

<script>
import "jquery/dist/jquery.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-dt/js/dataTables.dataTables";
import "datatables.net-dt/css/jquery.dataTables.min.css";
import $ from "jquery";

export default {
  mounted() {
    $("#finalleaderboard").DataTable({
      ajax: "https://dm-ai-evaluation.westeurope.cloudapp.azure.com/score/finalall",
      paging: false,
      searching: false,
      info: false,
      order: [[8, "desc"]],

      columns: [
        { data: "group_name" },
        { data: "waldo_score" },
        { data: "waldo_ranked" },
        { data: "movie_score" },
        { data: "movie_ranked" },
        { data: "race_score" },
        { data: "race_ranked" },
        { data: "iq_score" },
        // { data: "iq_ranked" },
        { data: "total_score" },
      ],

      columnDefs: [
        {
          targets: [1, 2, 3, 4, 5, 6, 7, 8],
          className: "dt-body-center",
        },
      ],
    });
  },
};
</script>



<style scoped>
@import "https://cdn.datatables.net/1.11.3/css/jquery.dataTables.min.css";

table {
  width: 90% !important;
  margin-top: 20px;
  padding-top: 20px;
  border: 1px solid rgb(65, 57, 57);
  background-color: rgb(65, 57, 57);
  box-shadow: 15px 15px 10px #888;
}

tr,
td {
  background-color: rgb(65, 57, 57);
}

th {
  color: rgb(255, 255, 255);
  font-size: 20px;
}
</style>