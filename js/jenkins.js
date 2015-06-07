(function()
{
        /*
         * Jenkins Datasource
         */
	var jenkinsDatasource = function (settings, updateCallback) {
		var self = this;
		var currentSettings = settings;
		var timer;

		function stopTimer() {
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
		}

		function updateTimer() {
			stopTimer();
			timer = setInterval(self.updateNow, currentSettings.refresh * 1000);
		}

		this.updateNow = function () {

                   var random = Math.round(Math.random() * 100);
                   
                   if (random < 26) {
                     state = "Unknown";
                   } else if (random < 51) {
                     state = "Failed";
                   } else if (random < 76) {
                     state = "Unstable";
                   } else {
                     state = "Stable";
                   }

                   data = {
                     buildState : state
                   };
                   updateCallback(data);
		}

		this.onDispose = function () {
			stopTimer();
		}

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
			updateTimer();
		}

		updateTimer();
	};

	freeboard.loadDatasourcePlugin({
		"type_name": "jenkins",
		"display_name": "Jenkins",
		"settings": [
			{
				"name": "refresh",
				"display_name": "Refresh Every",
				"type": "number",
				"suffix": "seconds",
				"default_value": 10
			},
			{
				"name": "build_name",
				"display_name": "Build Name",
				"type": "string",
				"default_value": ""
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new jenkinsDatasource(settings, updateCallback));
		}
	});

	freeboard.addStyle('.jenkins-indicator-light', "border-radius:50%;width:22px;height:22px;border:2px solid #3d3d3d;margin-top:5px;float:left;background-color:#222;margin-right:10px;");
	freeboard.addStyle('.jenkins-indicator-light.failed', "background-color:Red;box-shadow: 0px 0px 15px #FF9900;border-color:#FDF1DF;");
	freeboard.addStyle('.jenkins-indicator-light.unstable', "background-color:Yellow;box-shadow: 0px 0px 15px #FF9900;border-color:#FDF1DF;");
	freeboard.addStyle('.jenkins-indicator-light.stable', "background-color:Blue;box-shadow: 0px 0px 15px #FF9900;border-color:#FDF1DF;");
	freeboard.addStyle('.jenkins-indicator-text', "margin-top:10px;");
    var jenkinsBuildIndicatorWidget = function (settings) {
        var self = this;
        var titleElement = $('<h2 class="section-title"></h2>');
        var stateElement = $('<div class="jenkins-indicator-text"></div>');
        var indicatorElement = $('<div class="jenkins-indicator-light"></div>');
        var currentSettings = settings;
        var isOn = false;

        /*
           UNKNOWN, FAILED, UNSTABLE, STABLE
        */
        var buildState = "UNKNOWN";

        function updateState() {
            indicatorElement.toggleClass("failed", buildState === "FAILED");
            indicatorElement.toggleClass("unstable", buildState === "UNSTABLE");
            indicatorElement.toggleClass("stable", buildState === "STABLE");

            if (buildState === "FAILED") {
                stateElement.text("Failed");
            } else if (buildState == "UNSTABLE") {
                stateElement.text("Unstable");
            } else if (buildState == "STABLE") {
                stateElement.text("Stable");
            } else {
                stateElement.text("Unknown");
            }
        }

        this.render = function (element) {
            $(element).append(titleElement).append(indicatorElement).append(stateElement);
        }

        this.onSettingsChanged = function (newSettings) {
            currentSettings = newSettings;
            titleElement.html((_.isUndefined(newSettings.title) ? "" : newSettings.title));
            updateState();
        }

        this.onCalculatedValueChanged = function (settingName, newValue) {
            if (settingName == "value") {
                buildState = newValue.toUpperCase();
            }

            updateState();
        }

        this.onDispose = function () {
        }

        this.getHeight = function () {
            return 1;
        }

        this.onSettingsChanged(settings);
    };

    freeboard.loadWidgetPlugin({
        type_name: "jenkins_build_indicator",
        display_name: "Jenkins Build Indicator",
        settings: [
            {
                name: "title",
                display_name: "Title",
                type: "text"
            },
            {
                name: "value",
                display_name: "Value",
                type: "calculated"
            }
        ],
        newInstance: function (settings, newInstanceCallback) {
            newInstanceCallback(new jenkinsBuildIndicatorWidget(settings));
        }
    });

}());
