$(document).ready(function () {
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
    }  ;

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
            var title = prompt('Titre:');
            if (title) {
                //envoi de la requete de création vers le serveur
                $.post('events.json', // your url
                    { event:{
                        title:title,
                        start:start,
                        end:end,
                        allDay:allDay,
                        editable:true
                    }}
                );

            }
            calendar.fullCalendar('unselect');
            calendar.fullCalendar( 'refetchEvents' ) ;
        },
        //Déplacement d'un evenement par glisser/déposer
        eventDrop:update_function,
        //Redimensionnement d'un evenement
        eventResize:update_function
    });
});
