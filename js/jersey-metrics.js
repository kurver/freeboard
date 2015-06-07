(function()
{

        /*
         * Jersey Metrics Datasource
         */
	var jerseyMetricsDatasource = function (settings, updateCallback) {
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
                   $.ajax({
                     url: settings["app_name"] + ".json",
                     success: function (data) {
                       updateCallback(data);
                     },
                     error: function (xhr, status, error) {
                     }
                   });

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
		"type_name": "jerseyMetrics",
		"display_name": "Jersey Metrics",
		"settings": [
			{
				"name": "refresh",
				"display_name": "Refresh Every",
				"type": "number",
				"suffix": "seconds",
				"default_value": 10
			},
			{
				"name": "app_name",
				"display_name": "Application Name",
				"type": "string",
				"default_value": ""
			}
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new jerseyMetricsDatasource(settings, updateCallback));
		}
	});
}());
