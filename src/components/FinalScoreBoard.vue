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
          <th>IQ Ranked</th>
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
      // ajax: "https://dm-ai-evaluation.westeurope.cloudapp.azure.com/score/all",
      ajax: "http://localhost:4242/score/finalall",
      paging: true,
      searching: true,
      info: true,
      order: [[9, "desc"]],

      columns: [
        { data: "group_name" },
        { data: "waldo_score" },
        { data: "waldo_ranked" },
        { data: "movie_score" },
        { data: "movie_ranked" },
        { data: "race_score" },
        { data: "race_ranked" },
        { data: "iq_score" },
        { data: "iq_ranked" },
        { data: "total_score" },
      ],

      columnDefs: [
        {
          targets: [1, 2, 3, 4, 5, 6, 7, 8, 9],
          className: "dt-body-center",
        },
      ],
    });
  },
};
</script>



<style scoped>
@import "https://cdn.datatables.net/1.11.3/css/jquery.dataTables.min.css";

.submission-form {
  height: 1000px;
  width: 70%;
  background-color: rgb(167, 167, 167);
  box-shadow: 15px 15px 10px #888;
  margin: auto;
  border-radius: 1%;
  padding: 20px;
}

table {
  width: 90% !important;
  margin-top: 20px;
  padding-top: 20px;
}

th {
  color: rgb(0, 0, 0);
  font-size: 20px;
}
</style>