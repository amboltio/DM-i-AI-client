<template>
  <div class="submission-form">
    <table id="leaderboard" class="display" style="width: 50%">
      <thead>
        <tr>
          <th>Team Name</th>
          <th>Where's Waldo?</th>
          <th>Movie Reviews</th>
          <th>Racing Game</th>
          <th>IQ Test</th>
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
    $("#leaderboard").DataTable({
      ajax: "https://dm-ai-evaluation.westeurope.cloudapp.azure.com/score/all",
      paging: false,
      searching: false,
      info: false,
      order: [[5, "desc"]],

      columns: [
        { data: "group_name" },
        { data: "waldo_score" },
        { data: "movie_score" },
        { data: "race_score" },
        { data: "iq_score" },
        { data: "total_score" },
      ],

      columnDefs: [
        {
          targets: [1, 2, 3, 4, 5],
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
  background-color: rgb(65, 57, 57);
  box-shadow: 15px 15px 10px #888;
  margin: auto;
  border-radius: 1%;
}

table {
  width: 90% !important;
  margin-top: 20px;
  padding-top: 20px;
}

th {
  color: white;
  font-size: 20px;
}
</style>