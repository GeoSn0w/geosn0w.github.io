$(document).ready(function() {
$('.content').remove();

var a = 3;
$('.content,.specific,.project,.share').draggable({ handle: '.NSWindowTitle', start: function(event, ui) { $(this).css("z-index", a++); }});
$(".window").draggable({ handle: '.NSWindowTitle, .title-mac, .tab', refreshPositions: true, containment: 'window', start: function(event, ui) { $(this).css("z-index", a++); } });

}); 