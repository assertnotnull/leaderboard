Playerslist = new Mongo.Collection('players');

if (Meteor.isClient) {
  Template.leaderboard.helpers({
    'player': function() {
      var currentUserId = Meteor.userId();
      // since autopublish package was removed and playerslist is scoped from Meteor.publish,
      // createdBy can be removed
      // (autopublish allowed to do on client: Playerlist.find().fetch() )
      //
      //return Playerslist.find({createdBy: currentUserId}, {sort: {score: -1, name: 1}});

      return Playerslist.find({}, {sort: {score: -1, name: 1}});
    },
    'selectedClass': function(){
      var playerId = this._id;
      var sessionPlayer = Session.get('selectedPlayer');
      if(playerId == sessionPlayer){
        return "selected";
      }
    },
    'showSelectedPlayer': function(){
      var selectedPlayer = Session.get('selectedPlayer');
      return Playerslist.findOne(selectedPlayer);
    }
  });

  Template.leaderboard.events({
    'click .player': function() {
      console.log("You clicked a .player element");
      var playerId = this._id;
      Session.set('selectedPlayer', playerId);
    },
    'click .increment': function(){
      var selectedPlayer = Session.get('selectedPlayer');
      // Playerslist.update(selectedPlayer, {$inc: {score: 5}});
      Meteor.call('modifyPlayerScore', selectedPlayer, 5);
    },
    'click .decrement': function(){
      var selectedPlayer = Session.get('selectedPlayer');
      // Playerslist.update(selectedPlayer, {$inc: {score: -5} });
      Meteor.call('modifyPlayerScore', selectedPlayer, -5);
    },
    'click .remove': function(){
      var selectedPlayer = Session.get('selectedPlayer');
      // Playerlist.remove(selectedPlayer);
      Meteor.call('removePlayerData', selectedPlayer);
    }
  });

  Template.addPlayerForm.events({
    'submit form': function(event){
       event.preventDefault();
       var playerName = event.target.playerName.value;
       var currentUserId = Meteor.userId();
       Playerslist.insert({name: playerName, score: 0, createdBy: currentUserId});
       Meteor.call('insertPlayerData', playerName);
    }
  });

  Meteor.subscribe('thePlayers');
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    Meteor.publish('thePlayers', function(){
      var currentUserId = this.userId;
      return Playerslist.find({createdBy: currentUserId});
    });
  });

  // don't forget to remove package insecure
  // it removes the access to methods (insert, update, remove) from client
  // so you need to recreate those methods
  Meteor.methods({
    'insertPlayerData': function(playerNameVar){
      var currentUserId = Meteor.userId();
      PlayersList.insert({
        name: playerNameVar,
        score: 0,
        createdBy: currentUserId
      });
    },
    'removePlayerData': function(selectedPlayer) {
      Playerslist.remove(selectedPlayer);
    },
    'modifyPlayerScore': function(selectedPlayer, scoreValue) {
      Playerslist.update(selectedPlayer, {$inc: {score: scoreValue}})
    }
  });
}
