 (function(){

  var today = new Date();

    $( "#datepicker" ).datepicker().val( (today.getMonth()+1) + '/' + today.getDate()+'/'+today.getFullYear());
    

 }());