import { Component , OnInit, ViewChild, ElementRef, Input} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import SampleJson from '../assets/evacuations.json';

import * as H from '../assets/mapsjs-core.js';

declare var H: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HereMapDemo';  
  
  @ViewChild("map", { static: true }) public mapElement: ElementRef;  
  
  public lat: any = '37.787663';  
  public lng: any = '-122.396644'; 
  public safeLat: any = '37.629063';  
  public safeLng: any = '-122.378955';  
  //37.629063, -122.378955
  public width: any = '1000px';  
  public height: any = '600px';  
  
  private platform: any;  
  private map: any; 
  private ui: any; 
  private behavior: any; 
  
  private _appId: string = '9n-DSggWgGyXgJdXjvaOs0qSohBoLe14pDuZ_rZJ4-0';  
  private _appCode: string = 'uuuuuu';  

  public address: string;
  public txtTitle: string;
  public txtDescription: string;
  public txtFlights: string;
  
  public safeButton;
  public findButton;
  public isFirstStep = true;
  public isEnd = false;
  public isSidebarVisible = false;

  public evacuationsJason;
  
  public constructor() {  
    console.log('Reading local json files');
 console.log(SampleJson);
 
 this.evacuationsJason = SampleJson;
      
  }  
  
  public ngOnInit() {  
    this.width = window.innerWidth + "px";
    this.height = (window.innerHeight - 60 ) + "px";
    console.log("size:" + this.width + " hei:" + this.height);
    
    this.platform = new H.service.Platform({  
      'apikey':   '9n-DSggWgGyXgJdXjvaOs0qSohBoLe14pDuZ_rZJ4-0'
    }); 
      
  }  
  
  public ngAfterViewInit() {  

    var defaultLayers = this.platform.createDefaultLayers();
    this.map = new H.Map(this.mapElement.nativeElement,defaultLayers.vector.normal.map); 
  
    this.behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(this.map));  
    this.ui = H.ui.UI.createDefault(this.map, defaultLayers);  
    this.map.setCenter({ lat: this.lat, lng: this.lng });  
    this.map.setZoom(14); 

    //let americaMarker = new H.map.Marker({lat:this.lat,lng:this.lng});
    //this.map.addObject(americaMarker);
    
    
  }  
  
  showDisasters(lat, lng){
    //alert("RED ALERT: Go inmediately to safe place!!!");
    this.isSidebarVisible = true;
    this.txtTitle = "WARNING!!!";
    this.txtDescription = "RED ALERT: Go inmediately to safe place!!!";
    this.isFirstStep = false;
    console.log("inside show disasters");
    var index = 2;
    while (index <= 6) {

      let circle = new H.map.Circle(
        {lat:lat - 0.002 * index,lng:lng-0.002 * index},
        250,
        {
          style: {
            strokeColor: 'rgba(255, 165, 0, 0.6)', // Color of the perimeter
            lineWidth: 2,
            fillColor: 'rgba(255, 0, 0, 0.7)'  // Color of the circle
          }
        }
      );
      this.map.addObject(circle);
      index += 1;
    }
    

  }
  addGeocodedMarker(){
    console.log("address: " + this.address);

    var _self = this;
    var onResult = function(result) {
      console.log("result:",result);
      var locations = result.Response.View[0].Result,
          position,
          marker;
      
      var geoLat;
      var geoLon; 
      for (let i = 0;  i < locations.length; i++) {
        geoLat = locations[i].Location.DisplayPosition.Latitude;
        geoLon = locations[i].Location.DisplayPosition.Longitude;
        _self.lat = geoLat;
        _self.lng = geoLon;
        position = {
          lat: geoLat,
          lng: geoLon
        };
        marker = new H.map.Marker(position);
        _self.map.addObject(marker);
        _self.map.setCenter({ lat: geoLat, lng: geoLon });  
        _self.map.setZoom(14);  
      }
      _self.showDisasters(geoLat, geoLon);
      
      
    };
    
    var geocodingParams = {
      searchText: this.address
    };
    var geocoder = this.platform.getGeocodingService();

    geocoder.geocode(geocodingParams, onResult, function(e) {
      console.log("error e:",e);
      alert(e);
    });


  }
  startOver(){
    this.isSidebarVisible = false;
    this.txtFlights = "";
    this.txtDescription = "";
    this.txtTitle = "";

    this.isFirstStep = true;
    this.isEnd = false;

    var objetsArray = this.map.getObjects()

    this.map.removeObjects(objetsArray);
    
  } 
  showDirections(){
    console.log("directions!!!");
    this.isEnd = true;
    var router = this.platform.getRoutingService(),
      routeRequestParams = {
        mode: 'fastest;car',
        representation: 'display',
        routeattributes : 'waypoints,summary,shape,legs',
        maneuverattributes: 'direction,action',
        waypoint0: this.lat + ',' + this.lng, // Brandenburg Gate
        //coit tower hill 37.802416, -122.406098
        waypoint1: this.safeLat + ',' + this.safeLng  // Friedrichstraße Railway Station
      };
  
      var _self = this;
      var onSuccess = function(result) {
        console.log("result:",result);
        var route = result.response.route[0];
        console.log("route:", route);
        var summary = route.summary;
        var content = 'Total distance to safe place: ' + summary.distance  + ' mts. ';
        var travelTime = Math.floor(summary.travelTime / 60)  +' minutes '+ (summary.travelTime % 60)  + ' seconds';
        content += 'Travel Time: ' + travelTime + ' (in current traffic). ';
     
        //alert(content);
        _self.txtTitle = "SAFE PLACE INFO";
        _self.txtDescription = content;
        _self.showList();


        
        _self.addRouteShapeToMap(route);
        _self.seeInstructions(route);
        _self.addManueversToMap(route);

        
        
        //_self.addWaypointsToPanel(route.waypoint);
        //_self.addManueversToPanel(route);
        //_self.addSummaryToPanel(route.summary);
        
      };
  
    router.calculateRoute(
      routeRequestParams,
      onSuccess,
      this.onError
    );
  }
  showList(){
    var flight = "<center>Flights Available</center>";
    for(var i= 0; i < 3 ; i++){
      var number = i + 1;
      let dateString = SampleJson.evacuations.data[i].itineraries[0].segments[0].departure.at;
      let newDate = new Date(dateString);
      flight = flight + "<br/><br/><b>Flight " + number + "</b><br/>" + SampleJson.evacuations.data[i].price.currency + " " + SampleJson.evacuations.data[i].price.total +
    " departing " +  newDate.toUTCString() +
    " arriving at " + SampleJson.evacuations.data[i].itineraries[0].segments[0].arrival.iataCode +
    " <br/><a href='#'>Select this flight</a> ";
    }
    this.txtFlights = flight

  }

  
  seeInstructions(route){
    var group = new H.map.Group();

    this.map.addObject(group);
    var _self = this;

    // add 'tap' event listener, that opens info bubble, to the group
    group.addEventListener('tap', function (evt) {
      // event target is the marker itself, group is a parent event target
      // for all objects that it contains
      var bubble =  new H.ui.InfoBubble(evt.target.getGeometry(), {
        // read custom data
        content: evt.target.getData()
      });
      // show info bubble
      _self.ui.addBubble(bubble);
    }, false);

    for (var i = 0;  i < route.leg.length; i += 1) {
      for (var j = 0;  j < route.leg[i].maneuver.length; j += 1) {
        // Get the next maneuver.
        var maneuver = route.leg[i].maneuver[j];
        // Add a marker to the maneuvers group
        /*var marker =  new H.map.Marker({
          lat: maneuver.position.latitude,
          lng: maneuver.position.longitude});
        marker.instruction = maneuver.instruction;
        this.map.addObject(marker);*/

        var svgMarkup = '<svg width="24" height="24" ' +
    'xmlns="http://www.w3.org/2000/svg">' +
    '<rect stroke="white" fill="#ffa500" x="1" y="1" width="22" ' +
    'height="22" /><text x="12" y="18" font-size="12pt" ' +
    'font-family="Arial" font-weight="bold" text-anchor="middle" ' +
    'fill="black">E</text></svg>';

// Create an icon, an object holding the latitude and longitude, and a marker:
var icon = new H.map.Icon(svgMarkup),
    coords = {lat: maneuver.position.latitude,
      lng: maneuver.position.longitude},
    marker = new H.map.Marker(coords, {icon: icon});

        // add custom data to the marker
        marker.setData(maneuver.instruction);
        group.addObject(marker);
      }
    }
  }
  
  /**
   * This function will be called if a communication error occurs during the JSON-P request
   * @param  {Object} error  The error message received.
   */
  onError(error) {
    alert('Can\'t reach the remote server');
  }
  
  //var routeInstructionsContainer = document.getElementById('panel');
  
  
  
  addRouteShapeToMap(route){
    var lineString = new H.geo.LineString(),
      routeShape = route.shape,
      polyline;
  
    routeShape.forEach(function(point) {
      var parts = point.split(',');
      lineString.pushLatLngAlt(parts[0], parts[1]);
    });
  
    polyline = new H.map.Polyline(lineString, {
      style: {
        lineWidth: 4,
        strokeColor: 'rgba(0, 0, 0, 0.7)'
      }
    });
    // Add the polyline to the map
    this.map.addObject(polyline);
    // And zoom to its bounding rectangle
    this.map.getViewModel().setLookAtData({
      bounds: polyline.getBoundingBox()
    });
  }
  
  
  addManueversToMap(route){
    var svgMarkup = '',
      dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}}),
      group = new  H.map.Group(),
      i,
      j;
  
    // Add a marker for each maneuver
    for (i = 0;  i < route.leg.length; i += 1) {
      for (j = 0;  j < route.leg[i].maneuver.length; j += 1) {
        // Get the next maneuver.
        var maneuver = route.leg[i].maneuver[j];
        // Add a marker to the maneuvers group
        var marker =  new H.map.Marker({
          lat: maneuver.position.latitude,
          lng: maneuver.position.longitude} ,
          {icon: dotIcon});
        marker.instruction = maneuver.instruction;
        group.addObject(marker);
      }
    }
  
    group.addEventListener('tap', function (evt) {
      this.map.setCenter(evt.target.getGeometry());
      
    }, false);
  
    // Add the maneuvers group to the map
    this.map.addObject(group);
  }
  
  
  addWaypointsToPanel(waypoints){
  
  
  
    var nodeH3 = document.createElement('h3'),
      waypointLabels = [],
      i;
  
  
     for (i = 0;  i < waypoints.length; i += 1) {
      waypointLabels.push(waypoints[i].label)
     }
  
     nodeH3.textContent = waypointLabels.join(' - ');
  
  }
  
  /**
   * Creates a series of H.map.Marker points from the route and adds them to the map.
   * @param {Object} route  A route as received from the H.service.RoutingService
   */
  addSummaryToPanel(summary){
    var summaryDiv = document.createElement('div'),
     content = '';
     content += 'Total distance: ' + summary.distance  + 'm.';
     var travelTime = Math.floor(summary.travelTime / 60)  +' minutes '+ (summary.travelTime % 60)  + ' seconds.';
     content += 'Travel Time: ' + travelTime + ' (in current traffic)';
  
  
     alert(content);
    summaryDiv.style.fontSize = 'small';
    summaryDiv.style.marginLeft ='5%';
    summaryDiv.style.marginRight ='5%';
    summaryDiv.innerHTML = content;
  }
  
  addManueversToPanel(route){
  
  
  
    var nodeOL = document.createElement('ol'),
      i,
      j;
  
    nodeOL.style.fontSize = 'small';
    nodeOL.style.marginLeft ='5%';
    nodeOL.style.marginRight ='5%';
    nodeOL.className = 'directions';
  
       // Add a marker for each maneuver
    for (i = 0;  i < route.leg.length; i += 1) {
      for (j = 0;  j < route.leg[i].maneuver.length; j += 1) {
        // Get the next maneuver.
        var maneuver = route.leg[i].maneuver[j];
  
        var li = document.createElement('li'),
          spanArrow = document.createElement('span'),
          spanInstruction = document.createElement('span');
  
        spanArrow.className = 'arrow '  + maneuver.action;
        spanInstruction.innerHTML = maneuver.instruction;
        li.appendChild(spanArrow);
        li.appendChild(spanInstruction);
  
        nodeOL.appendChild(li);
      }
    }
  
  }
  

}
