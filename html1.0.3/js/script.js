(function() {
    totaltime = 7200;
    var m = L.map('mapID').setView([35.978, 134.319], 5);





    // $("#content").append("<select name='add1' onchange='choosetime(this.value)'><option value='1'>兩小時車程</option><option value='2'>三小時車程</option><option value='3'>四小時車程</option></select>");




    
    var placedic={};
    var yoo=0;

    var nowroute;
    var markers=L.layerGroup();
    // var cartodbAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors,<a href="https://github.com/sskingdon">sskingdon</a> <a href="https://github.com/Sims-Liou">Sims-liou</a> <a href="https://github.com/yuclin">yuclin</a>';
    // L.tileLayer({}, {
    // 			attribution: cartodbAttribution,
    // 			opacity: 1
    // 		}).addTo(m);
    var collist = ["blue", "yellow", "green", "orange", "purple"];
    var weilist = ["12", "12", "12", "12", "12"];
    var baseMaps = [
        "Stamen.Watercolor",
        "OpenStreetMap.Mapnik",
        "OpenStreetMap.DE",
        "Esri.WorldImagery",
        //"MapQuestOpen.OSM"
    ];
    var havething=0;
    //control 右上清單
    var lc = L.control.layers.provided(baseMaps).addTo(m);
    // L.control.attribution().removeAttribution().addTo(m);
    var data = {},
        layers = {},
        fills = [
            "rgb(197,27,125)",
            "rgb(222,119,174)",
            "rgb(213, 62, 79)",
            "rgb(84, 39, 136)",
            "rgb(247,64,247)",
            "rgb(244, 109, 67)",
            "rgb(184,225,134)",
            "rgb(127,188,65)",
            "rgb(69, 117, 180)"
        ];
    d3.json("json/jpfinal.json", dealwithData);

    function dealwithData(oa) {
        data.json = oa.features.map(function(v) {
            return [v.geometry.coordinates[1], v.geometry.coordinates[0], v.properties.Name, v.properties.point];
        });
        console.log(data.json);
        for (var i = 0; i < data.json.length; i++) {
                // console.log(superbig[i][0]);
                if (placedic[data.json[i][2]] == null) {
                    var t=[data.json[i][0],data.json[i][1]];
                    // console.log(data.json[i][2]);
                    placedic[t]=data.json[i][2];
                } // console.log(i);
            }
        // console.log(placedic);
        points();
        //veronoi();
        //delaunay();
        clusters();
        //quadtree();
        bestroute();
        allpath();
    }
    function allpath() {
        d3.json("json/allroute.json", pao);

        function pao(alro) {
            ss = alro.features.map(function(t) {
                return [
                    [t.fromx, t.fromy],
                    [t.tox, t.toy]
                ];
            });
            // console.log(ss);
            layers.allpath = L.polyline(ss, {
                'color': 'black',
                'weight': '0.1'
            });
            lc.addOverlay(layers.allpath, "allpath");
        }

    }
    function points() {
        layers.points = L.layerGroup(data.json.map(function(v) {
            // console.log(v);
            return L.circleMarker(L.latLng(v[0], v[1]), {
                radius: 5,
                stroke: false,
                fillOpacity: 1,
                clickable: false,
                color: fills[Math.floor((Math.random() * 9))]
            })
        }));
        lc.addOverlay(layers.points, "points");
    }
    // function veronoi(){
    //     data.veronoi = d3.geom.voronoi(data.json);
    //     layers.veronoi = L.layerGroup(data.veronoi.map(function(v){
    // 		return L.polygon(v,{stroke:false,fillOpacity:0.7,color:fills[Math.floor((Math.random()*9))]})
    // 	}));
    // 	lc.addOverlay(layers.veronoi,"veronoi");
    // }
    // function delaunay(){
    //     data.delaunay = d3.geom.delaunay(data.json);
    //     layers.delaunay = L.layerGroup(data.delaunay.map(function(v){
    // 		return L.polygon(v,{stroke:false,fillOpacity:0.7,color:fills[Math.floor((Math.random()*9))]})
    // 	}));
    // 	lc.addOverlay(layers.delaunay,"delaunay");
    // }
    function clusters() {
        layers.clusters = new L.MarkerClusterGroup();
        layers.clusters.addLayers(data.json.map(function(v) {
            // console.log(v);
            return L.marker(L.latLng(v[0], v[1]), {
                    alt: v[2]
                })
                .bindTooltip("<strong>" + v[2] + "</strong><br>" + "<strong>熱度</strong>:" + v[3] + "<br/>" + v[0] + "," + v[1]).openTooltip()
                .bindPopup("<strong>" + v[2] + "</strong><br>" + "<strong>熱度</strong>:" + v[3] + "<br/>" + v[0] + "," + v[1]).openPopup();
        }));
        layers.clusters.on('click', fi);

        lc.addOverlay(layers.clusters, "clusters");
    }

    //zhwiki API
    function fi(ev) {
        var f = ev.originalEvent.path[0].alt;
        // console.log(jawiki[f]);
        if (jawiki[f] != null) {
            console.log("ja");
            var f2wiki = jawiki[f];
            $.ajax({
                type: "GET",
                url: "http://ja.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + f2wiki + "&callback=?",

                contentType: "application/json; charset=utf-8",
                async: false,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    // console.log(data.error!=null);
                    var markup = data.parse.text["*"];
                    var i = $('<div></div>').html(markup);

                    // remove links as they will not work
                    i.find('a').each(function() {
                        $(this).replaceWith($(this).html());
                    });

                    // remove any references
                    i.find('sup').remove();

                    // remove cite error
                    i.find('.mw-ext-cite-error').remove();
                    // console.log(i.find('p')[0].innerHTML);

                    $('#article').html($(i).find('p'));
                    $('#article').append('<a href="https://ja.wikipedia.org/wiki/' + f2wiki + '" target="_blank">想看更多...</a>');
                },
                error: function(errorMessage) {}
            });
        } else {
            console.log(f);
            $.ajax({
                type: "GET",
                url: "http://zh.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + f + "&callback=?",

                contentType: "application/json; charset=utf-8",
                async: false,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    if (data.error == null) {
                        var markup = data.parse.text["*"];
                        var i = $('<div></div>').html(markup);
                        i.find('a').each(function() {
                            $(this).replaceWith($(this).html());
                        });
                        i.find('sup').remove();
                        i.find('.mw-ext-cite-error').remove();
                        // console.log(i.find('p')[0].innerHTML);

                        $('#article').html($(i).find('p'));
                        $('#article').append('<a href="https://zh.wikipedia.org/wiki/' + f + '" target="_blank">想看更多...</a>');
                    } else {
                        // https://www.google.com.tw/search?q=00
                        $('#article').html('<p>Oops!!! Wiki 找不到...</p>');
                        $('#article').append('<a href="https://www.google.com.tw/search?q=' + f + '" target="_blank">Google為您搜尋...</a>');
                    }
                },
                error: function(errorMessage) {
                    console.log("error");
                }
            });
        };
    }; ////////////////////////////////////////////////////////////////////////////////////fu end

    //creat f2wiki dic
    var jawiki = {};
    d3.json("json/jawiki.json", f2wiki);

    function f2wiki(jw) {
        jawikilist = jw.ja.map(function(z) {
            return [z.Name, z.Value];
        });

        for (var i = 0; i < jawikilist.length; i++) {
            if (jawiki[jawikilist[i][0]] == null) {
                jawiki[jawikilist[i][0]] = jawikilist[i][1];
            }
        };
    };

    // function quadtree(){
    //     data.quadtree = d3.geom.quadtree(data.json.map(function(v){return {x:v[0],y:v[1]};}));
    // 	layers.quadtree = L.layerGroup();
    // 	data.quadtree.visit(function(quad, lat1, lng1, lat2, lng2){
    // 		layers.quadtree.addLayer(L.rectangle([[lat1,lng1],[lat2,lng2]],{fillOpacity:0,weight:1,color:"#000",clickable:false}));
    // 	});
    // 	lc.addOverlay(layers.quadtree,"quadtree");
    // }


    // //Test
    // var aggregated = turf.sum(
    //   "json/jpBlock.topo.json", "json/jp.json", 'count', 'sum');

    // var resultFeatures = points.features.concat(aggregated.features);

    // var result = {
    //   "type": "FeatureCollection",
    //   "features": resultFeatures
    // };
    // console.log(result);


    // Heatmap
    // layers.svg=L.d3("json/jpBlock.topo.json",{
    // 	topojson:"singleSeatBlock",
    // 	svgClass : "YlOrRd",
    // 	pathClass:function(d) {
    // 		// return "town q" + (10-layers.svg.quintile(d.properties.pop/layers.svg.path.area(d)))+"-11";

    // 		var pt = d.properties.pop;
    // 		// console.log(pt);
    // 		if(pt==0){return "town q0-7"}
    // 		else if(0<pt&&pt<=20){return "town q1-7"}
    // 		else if(20<pt&&pt<=50){return "town q2-7"}
    // 		else if(50<pt&&pt<=100){return "town q3-7"}
    // 		else if(100<pt&&pt<=200){return "town q4-7"}
    // 		else if(200<pt&&pt<=500){return "town q5-7"}
    // 		else if(500<pt){return "town q6-7"}
    // 	},
    // 	before: function(data){
    // 		var _this = this;
    // 		// console.log(_this);
    // 		this.quintile=d3.scale.quantile().domain(data.geometries.map(function(d){
    // 			var pt = d.properties.pop;
    // 			if(pt==0){return 6}
    // 			else if(0<pt&&pt<=20){return 5}
    // 			else if(20<pt&&pt<=50){return 4}
    // 			else if(50<pt&&pt<=100){return 3}
    // 			else if(100<pt&&pt<=200){return 2}
    // 			else if(200<pt&&pt<=500){return 1}
    // 			else if(500<pt){return 0}
    // 		})).range(d3.range(11));
    // 		// this.quintile=d3.scale.quantile().domain(data.geometries.map(function(d){return d.properties.pop/_this.path.area(d);})).range(d3.range(11));
    // 	}
    // });
    // layers.svg.bindPopup(function(p){
    // 	var out =[];
    // 	out.push("<strong>Title</strong>: "+p['title']);
    // 	out.push("<strong>熱門度</strong>: "+p['pop']);
    // 	// for(var key in p){
    // 	// if(key !== "FOURCOLOR"){
    // 	// 	out.push("<strong>"+key+"</strong>: "+p[key]);
    // 	// 	}
    // 	// }
    // 	return out.join("<br/>");
    // 	});
    // lc.addOverlay(layers.svg,"Heatmap");

    //Heatmap VectorGrid
    fetch('json/jpBlock.topo.json').then(function(response) {
        return response.json();
    }).then(function(json) {
        var vectorGrid = L.vectorGrid.slicer(json, {
            vectorTileLayerStyles: {
                'singleSeatBlock': function(properties) {
                    console.log(properties.pop);
                    var p = properties.pop;
                    console.log(p === 0);
                    return {
                        fillColor: (20 < p && p <= 50) ? '#9AD695' :
                            (50 < p && p <= 100) ? '#FFFFBD' :
                            (100 < p && p <= 200) ? '#FEDF8B' :
                            (200 < p && p <= 500) ? '#FC8D5A' :
                            (500 < p) ? '#D53F50' : '#E6F599',
                        // '#A3007D' ,
                        fillOpacity: 0.5,
                        stroke: 0.1,
                        fill: true,

                    }

                }
            }
        });
        lc.addOverlay(vectorGrid, "Heatmap");
    });

    //route ################################################################################################################
        function bestroute() {
        var dic = {};
        d3.json("json/superbigtable.json", hi);

        function hi(ih) {
            superbig = ih.features.map(function(z) {
                return [
                    [z.Startx, z.Starty],
                    [
                        [
                            [z.firstx, z.firsty], z.firstdis, z.firstcartime, z.firstcount
                        ],
                        [
                            [z.secondx, z.secondy], z.seconddis, z.secondcartime, z.secondcount
                        ],
                        [
                            [z.thirdx, z.thirdy], z.thirddis, z.thirdcartime, z.thirdcount
                        ],
                        [
                            [z.fourthx, z.fourthy], z.fourthdis, z.fourthcartime, z.fourthcount
                        ],
                        [
                            [z.fifthx, z.fifthy], z.fifthdis, z.fifthcartime, z.fifthcount
                        ]
                    ]
                ]
            });

            for (var i = 0; i < superbig.length; i++) {
                // console.log(superbig[i][0]);
                if (dic[superbig[i][0]] == null) {
                    dic[superbig[i][0]] = superbig[i][1];
                } // console.log(i);
            }
            // console.log(dic["35.127547,139.037432"]);
            // console.log(dic);
            // console.log(Object.keys(dic).length);
        }
        layers.bestroute = L.layerGroup(data.json.map(function(v) {
            return L.circleMarker(L.latLng(v[0],v[1]), {
                radius: 5,
                stroke: false,
                fillOpacity: 1,
                clickable: true,
                color: 'red'
            }).bindPopup("<strong>" + v[2] + "</strong>").on('click', choose);

        }));
        lc.addOverlay(layers.bestroute, "bestroute");

        function choose() {
            nowusing=this;
            var secondlayer = [];
            console.log("yeah");
            // console.log(layers.bestroute.hasLayer(route))
            if (havething==1) {
              for (i in m._layers) {
                if (m._layers[i].options.format == undefined && i>7000) {
                     try {
                            m.removeLayer(m._layers[i]);
                        } catch (e) {
            // console.log("problem with " + e + m._layers[i]);
                        }
                    }
                }
          
            // console.log(m._layers);
            }
            var currentlat = this.getLatLng().lat;
            var currentlng = this.getLatLng().lng;
            currentpoint = [currentlat, currentlng];
            // console.log(currentpoint);
            // console.log(dic[currentpoint]);
            // console.log(dic[currentpoint]);
            // console.log(hphp);
            secondlayer.push(currentpoint);
            var temppath = dic[currentpoint];
            // console.log(temppath == null);
            if (temppath != null) {
                var tmpnum = 5;
                var flagg = 0;
                var drawlist = [];
                var weightlist = [];
                for (var gg = 0; gg < 5; gg++) {
                    if (temppath[gg][0][0] != 0 && temppath[gg][0][0] != null) {
                        var now = [currentpoint, temppath[gg][0]];
                        // console.log(temppath[gg][0]);
                        var won1 = temppath[gg][2];
                        var won2 = temppath[gg][3];
                        if (won2 < 2) {
                            won2 = 5;
                        } else {
                            won2 = won2 - 1;
                            won2 = won2 / 615;
                            won2 = won2 * 15;
                            won2 = won2 + 2;
                        }
                        var won = [won1, won2];
                        drawlist.push(now);
                        weightlist.push(won);
                        // console.log(temppath[gg][0][0]);
                        // console.log(gg);
                    } else {
                        if (flagg == 0) {
                            tmpnum = gg;
                            // console.log(tmpnum);
                            flagg = 1;
                        }
                    }
                }
                // console.log(drawlist);
                // console.log(tmpnum);
                // for (var x = 0; x < tmpnum; x++) {
                //     
                //
                // console.log(drawlist);
                // console.log(weightlist);
                // console.log();
                // console.log();
                // console.log();
                /////起始變數設定區
                // console.log(dic[currentpoint]);

                for (var x = 0; x < tmpnum; x++) {
                    // console.log(x);
                    var firstpoint = [drawlist[x][1]];
                    // console.log(firstpoint[0]);
                    var tmpflag = 0;
                    var cango = 0;
                    var thistime = parseInt(String(weightlist[x][0]));
                    var hphp=totaltime;
                    // console.log(hphp);
                    var nowtime = hphp - thistime;
                    if (nowtime > 0) {
                        var pathlist = [];
                        pathlist.length = 0;
                        // console.log(pathlist);
                        // console.log(currentpoint);
                        pathlist.push(currentpoint);
                        // console.log(pathlist);
                        // console.log(pathlist[0]);
                        // console.log(pathlist[1]);
                        pathlist.push(firstpoint[0]);
                        // console.log(pathlist[1]);
                        // console.log(pathlist);
                        var nowpoint = firstpoint[0];
                        // var prepoint=[];
                        // prepoint.push(currentpoint);
                        // console.log(currentpoint);

                        // console.log(firstpoint[0]);
                        // console.log(pathlist);
                        var counting=0;
                        while (cango == 0 && counting<15) {
                            
                            counting=counting+1;
                            tmpflag = 0;
                            var nowpointdic = dic[nowpoint];
                            // console.log(nowpoint);
                            // console.log(nowpointdic);
                            for (var y = 0; y < 5; y++) {
                                // console.log(y);
                                // console.log(nowpointdic[y][0][0]);
                                if(typeof(nowpointdic)==='undefined'){
                                    cango = 1;
                                    break;
                                }
                                if (nowpointdic[y][0][0] != 0 && nowpointdic[y][0][0] != null) {
                                    // console.log("ohyeah");
                                    // console.log(typeof(nowpointdic[y][0]));
                                    // console.log(pathlist);
                                    // console.log(pathlist.indexOf(nowpointdic[y][0]));
                                    var nimare = 0;
                                    for (var fuck = 0; fuck < pathlist.length; fuck++) {
                                        // console.log(typeof(pathlist[fuck]));
                                        if (String(pathlist[fuck]) === String(nowpointdic[y][0])) {
                                            nimare = 1;

                                            // console.log("same");
                                            break;
                                        }
                                    }
                                    if (nimare == 0) {
                                        // console.log("in");
                                        if (nowtime - nowpointdic[y][2] > 0) {
                                            console.log("push");
                                            nowtime = nowtime - nowpointdic[y][2];
                                            // prepoint.push(nowpoint);
                                            nowpoint = nowpointdic[y][0];
                                            pathlist.push(nowpoint);
                                            tmpflag = 1;
                                            break;
                                        } else {
                                            // console.log("oops");
                                        }
                                    } else {
                                        // console.log("NotThingHappend");
                                    }
                                }
                            }
                            if (tmpflag == 0) {
                                cango = 1;
                            }
                        }

                        // console.log(pathlist);

                        // console.log("drawing");
                        var route = new L.Polyline(pathlist, {
                            'color': collist[x],
                            'weight': weilist[x],
                            'opacity': 0.5,
                            'alt':pathlist
                        });
                        route.on('click', showpath)
                        // console.log(pathlist);
                        // var point = new L.marker(pathlist);
                    }
                    if (route != null) {
                        layers.bestroute.addLayer(route);
                        havething=1;
                        
                    }




                    // }
                    // console.log("finish!");
                }
            } else {
                alert("no route available");
            }

        }
    function showpath(ev){
        var f = ev.originalEvents;
        // console.log(this);
        var pathlist=this.getLatLngs();
        $('#content').css("height","15%");
        $('#route').append("所經路線<br/>");
        $('#route').css("height","15%");
        $('#article').css("height","70%");
         if(yoo==1){
            $('path[stroke="red"]').remove();
            $('#route').empty();
            $('div[class="leaflet-marker-icon leaflet-glyph-icon leaflet-zoom-animated leaflet-interactive"]').remove();
         }

        nowroute = new L.Polyline(pathlist, {
                            'color': 'red',
                            'weight': 20,
                            'opacity': 1,
                            'alt':pathlist
                        }).addTo(m);
        // console.log(typeof(nowroute));
        var markers=L.layerGroup(nowroute);
        m.addLayer(nowroute);
        var nowplacelist=[];
        for(var y=0;y<pathlist.length;y++){
            // console.log(typeof(pathlist[y]));
            // console.log(placedic);
            console.log([pathlist[y].lat,pathlist[y].lng]);
            var t=[pathlist[y].lat,pathlist[y].lng];
            var shit=placedic[t];
            console.log(shit);
            nowplacelist.push(shit);

        }
        console.log(placedic);
        // console.log(pathlist);
        // var nowpointt=
        console.log(nowplacelist);
        for (var x = 0; x < pathlist.length; x++) {
            L.marker(pathlist[x], {icon: L.icon.glyph({ prefix: '', cssClass:'sans-serif', glyph: x+1 }) })
            .bindTooltip("<strong>" + nowplacelist[x] + "</strong><br>" + pathlist[x].lat+ "," + pathlist[x].lng).openTooltip()
            .bindPopup("<strong>" + nowplacelist[x] + "</strong><br>" + pathlist[x].lat + "," + pathlist[x].lng).openPopup()
            .addTo(m);
        }
        yoo=1;
        for(var t=0;t<nowplacelist.length;t++){
            if(t!=nowplacelist.length-1){
                $("#route").append("<span id='"+t+"' class='myMOUSE'><u>"+nowplacelist[t]+"</u></span>");
                $("#"+t+">u").on('click', li);
                $("#route").append("-->");
            }else{
                $("#route").append("<span id='"+t+"' class='myMOUSE'><u>"+nowplacelist[t]+"</u></span>");
                $("#"+t+">u").on('click', li);
            }
        }
        
        // console.log(layers.bestroute);
        // console.log(m._layers);
        // layers.clusters.addLayers(data.json.map(function(v) {
        //     // console.log(v);
        //     return L.marker(L.latLng(v[0], v[1]), {
        //             alt: v[2]
        //         })
        //         .bindTooltip("<strong>" + v[2] + "</strong><br>" + "<strong>熱度</strong>:" + v[3] + "<br/>" + v[0] + "," + v[1]).openTooltip()
        //         .bindPopup("<strong>" + v[2] + "</strong><br>" + "<strong>熱度</strong>:" + v[3] + "<br/>" + v[0] + "," + v[1]).openPopup();
        // }));
        

        // console.log(this.innerHTML);
        
        
        function li(ev) {
        var f = this.innerHTML;
        console.log(jawiki[f]);
        if (jawiki[f] != null) {
            console.log("ja");
            var f2wiki = jawiki[f];
            $.ajax({
                type: "GET",
                url: "http://ja.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + f2wiki + "&callback=?",

                contentType: "application/json; charset=utf-8",
                async: false,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    // console.log(data.error!=null);
                    var markup = data.parse.text["*"];
                    var i = $('<div></div>').html(markup);

                    // remove links as they will not work
                    i.find('a').each(function() {
                        $(this).replaceWith($(this).html());
                    });

                    // remove any references
                    i.find('sup').remove();

                    // remove cite error
                    i.find('.mw-ext-cite-error').remove();
                    // console.log(i.find('p')[0].innerHTML);

                    $('#article').html($(i).find('p'));
                    $('#article').append('<a href="https://ja.wikipedia.org/wiki/' + f2wiki + '" target="_blank">想看更多...</a>');
                },
                error: function(errorMessage) {}
            });
        } else {
            console.log(f);
            $.ajax({
                type: "GET",
                url: "http://zh.wikipedia.org/w/api.php?action=parse&format=json&prop=text&section=0&page=" + f + "&callback=?",

                contentType: "application/json; charset=utf-8",
                async: false,
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    if (data.error == null) {
                        var markup = data.parse.text["*"];
                        var i = $('<div></div>').html(markup);
                        i.find('a').each(function() {
                            $(this).replaceWith($(this).html());
                        });
                        i.find('sup').remove();
                        i.find('.mw-ext-cite-error').remove();
                        // console.log(i.find('p')[0].innerHTML);

                        $('#article').html($(i).find('p'));
                        $('#article').append('<a href="https://zh.wikipedia.org/wiki/' + f + '" target="_blank">想看更多...</a>');
                    } else {
                        // https://www.google.com.tw/search?q=00
                        $('#article').html('<p>Oops!!! Wiki 找不到...</p>');
                        $('#article').append('<a href="https://www.google.com.tw/search?q=' + f + '" target="_blank">Google為您搜尋...</a>');
                    }
                },
                error: function(errorMessage) {
                    console.log("error");
                }
            });
        };
    };


    }



    } //bestroute 

    window.public = {};
    window.public.data = data;
    window.public.layers = layers;
}());