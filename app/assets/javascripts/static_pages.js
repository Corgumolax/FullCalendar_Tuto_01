$(document).ready(function () {
    var selected_div = null; // Variables pour mémoriser la séléction en cours
    var selected_event = null;

    // Fonction d'envoi d'une requête de mise à jour d'un évènement
    var update_function = function (event, dayDelta, minuteDelta, allDay, revertFunc, jsEvent, ui, view) {
        $.ajax({
            url:'/events/' + event._id, // prb d'url à modifier
            dataType:'json',
            type:"PUT",
            data:{
                event:{// re-use event's data
                    title:event.title,
                    start:event.start,
                    end:event.end,
                    allDay:event.allDay
                }
            }
        });
    };//fin update_function

    // Fonction de gestion des clicks => sélection
    var click_in_event = function(event, jsEvent, view) {
        if (selected_div) {   // si il existe un évènement précédement séléctionné
            selected_div.css('border', 'none'); // on supprime sa bordure css de
        }
        selected_div = $(this); // On mémorise la div sur laquelle on a cliqué
        selected_event = event; // on mémorise l'évènement
        $(this).css('border', 'solid 2px red'); // On entoure la sélection avec une bordure css
    }; //fin click_in_event

    // R.A.Z de la sélection
    function clear_selection(){
        selected_div = null;
        selected_event = null;
    }

    // Gestion du dialogue modal d'édition d'un évènement
    var edit_pop_up = function(data){
        $('#event-dlg').html(data).dialog({
            height:400,              // Taille du dialogue
            width: 410,
            resizable: false,        // Pas de redimensionnement
            title: 'Informations',   // Un titre
            modal:true,              // Dialogue modal => interrompt les autres interractions
            buttons: {               // Le bouton de validation
                "Enregistrer": function(){
                    $('#event_form').submit(); // Envoi les données du formulaire
                    $(this).dialog('close');   // Ferme le dialogue
                    $('#calendar').fullCalendar('unselect');  // efface le helper de sélection du créneau horaire
                    $('#calendar').fullCalendar('refetchEvents');  // Réaffiche le calendrier
                }
            },
            open: function() {  // a l'ouverture du dialogue
                //on retire l'écouteur des touches moméntanément sinon prb conflit suppr lors édition des champs texte
                $(document.documentElement).unbind('keyup',key_up_handler);
                $("#event-dlg").keypress(function(e) {       // gestion de la touche entrée
                    if (e.which == $.ui.keyCode.ENTER) {
                        e.preventDefault();
                        $(this).parent().find("button:eq(0)").trigger("click"); // simule le click sur le bouton enregistrer
                    }
                });
            },
            close: function( event, ui ) { // appelée à la fermeture du dialogue
                $("#event-dlg").unbind("keypress"); //on supprime la gestion de la touche entrée
                $(document.documentElement).bind('keyup',key_up_handler); // Rétablissement de l'écouteur des touches.

            }
        });
    };

    // Ecouteur pour l'appui des touches clavier
    var key_up_handler = function(event){
        if (selected_event) { // si il y a une sélection active
            if (event.which == 46 ) { //si a touche est "suppr"
                if (confirm("Etes vous certain de vouloir supprimer cet évènement?")) { // Demande de confirmation
                    $.ajax({ //Envoi de la requête de suppression
                        url:'/events/' + selected_event._id, // prb d'url à modifier
                        dataType:'json',
                        type:"DELETE"
                    }).done(function(){
                            calendar.fullCalendar('refetchEvents');
                            clear_selection();
                        }); //Réaffichage du calendrier qd fini.
                }
            }
        }
    };

    // Le calendrier à proprement parler
    var calendar = $('#calendar').fullCalendar({
        // paramètres de base
        // Let speak French - traduction des strings en français
        monthNames:['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        monthNamesShort:['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
        dayNames:['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        dayNamesShort:['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        titleFormat:{
            month:'MMMM yyyy',
            week:"'Semaine du' dd[ yyyy] {'au' [MMM] dd MMMM yyyy}",
            day:'dddd dd MMM yyyy'
        },
        columnFormat:{
            month:'ddd',
            week:'ddd dd/M',
            day:'dddd dd/M'
        },
        axisFormat:'HH:mm',
        timeFormat:{
            '':'HH:mm',
            agenda:'HH:mm{ - HH:mm}'
        },
        allDayText:"Journée entière",
        buttonText:{
            today:'aujourd\'hui',
            day:'jour',
            week:'semaine',
            month:'mois'
        },
        firstDay:1, //premier jour de la semaine => Lundi
        defaultView:'agendaWeek', // par défaut on affiche la semaine sous forme d'agenda
        header:{                      // Mise en forme de l'entete
            left:'prevYear,prev,next,nextYear,today', // à gauche: les boutons de navigation dans l'agenda
            center:'title', // au milieu: le titre
            right:'month,agendaWeek,agendaDay'         // à droite: les boutons de type de vue
        },

        editable:true, //permettre de modifier les évenements déjà créés
        selectable:true, //permettre de sélectionner des évenements
        events:'events.json', // source de données
        //callbacks et compagnies
        selectHelper:true,
        select:function (start, end, allDay) { //création d'un évenement
                $.ajax({
                    url:'events/new.js', // prb d'url à modifier
                    dataType:'html',
                    type:"GET",
                    data: { start: start, end: end },
                    success: edit_pop_up,
                    error: function(xhRequest, ErrorText, thrownError) {
                        alert("Error... " + ErrorText + "        " + thrownError);
                    }
                });
        },
        //Déplacement d'un evenement par glisser/déposer
        eventDrop:update_function,
        //Redimensionnement d'un evenement
        eventResize:update_function,
        //Click dans un évènement existant
        eventClick:click_in_event,
        // Gestion double click
        // Voir https://code.google.com/p/fullcalendar/issues/detail?id=231 et http://arshaw.com/fullcalendar/docs/event_rendering/eventRender/
        eventRender: function(event, element) {
            element.bind('dblclick', function() {

                $.ajax({
                    url:'events/' + event._id + '/edit.js', // prb d'url à modifier
                    dataType:'html',  // récupère le code html du formulaire
                    type:"GET",
                    success: edit_pop_up, // ouverture du dialogue modal
                    error: function(xhRequest, ErrorText, thrownError) {
                        alert("Error... " + ErrorText + "        " + thrownError);
                    }
                });
            });
        }
    }); // Fin FullCalendar

    // On détecte l'appui sur les touches au niveau du document
    $(document.documentElement).bind('keyup',key_up_handler)


});
