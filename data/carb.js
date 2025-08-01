

 
        let currentCountry = 'NG';
        const countryData = {
            'NG': { name: 'Nigeria', flag: '🇳🇬', defaultIntensity: 580, class: 'nigeria' },
            'ZA': { name: 'South Africa', flag: '🇿🇦', defaultIntensity: 820, class: 'south-africa' },
            'KE': { name: 'Kenya', flag: '🇰🇪', defaultIntensity: 240, class: 'kenya' },
            'EG': { name: 'Egypt', flag: '🇪🇬', defaultIntensity: 490, class: 'egypt' },
            'GH': { name: 'Ghana', flag: '🇬🇭', defaultIntensity: 380, class: 'ghana' }
        };

    

        function getCurrentDateTime() {
            const now = new Date();
            const date = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
            const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
            return { date, time };
        }

        function refresh(){
            const time = document.getElementById("time");
            const date = document.getElementById("date");

            const dateTime = getCurrentDateTime();
            
            time.textContent = dateTime.time;
            date.textContent = dateTime.date;
        }

        function updateCountryDateTime(countryCode) {
            const { date, time } = getCurrentDateTime();
            const dateElement = document.getElementById(`${countryCode.toLowerCase()}-date`);
            const timeElement = document.getElementById(`${countryCode.toLowerCase()}-time`);
            
            if (dateElement) dateElement.textContent = date;
            if (timeElement) timeElement.textContent = time;
        }

        function updateAllCountriesDateTime() {
            Object.keys(countryData).forEach(code => {
                updateCountryDateTime(code);
            });
        }

        async function getCarbonData() {
            const apiKey = "ShnO0yN9AwwNgMluzmq1";
            const countryCode = currentCountry;
            const proxy = "https://cors-anywhere.herokuapp.com/";
            const apiUrl = `https://api.co2signal.com/v1/latest?countryCode=${countryCode}`;

            try {
                const response = await fetch(proxy + apiUrl, {
                    headers: {
                        "auth-token": apiKey
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                console.log(data);
                console.log("✅ Carbon Intensity:", data.data.carbonIntensity);
                
                let date = new Date(data.data.datetime);
                
                function formatDate(date) {
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");
                    const year = date.getFullYear();
                    return `${day}/${month}/${year}`;
                }
                
                if(data) {
                    let dateString = formatDate(date);
                    let time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
                    return {
                        date: dateString, 
                        carbonIntensity: data.data.carbonIntensity,
                        carbonIntensityText: `${data.data.carbonIntensity} gCO₂/kWh`, 
                        time
                    };
                }

            } catch (err) {
                console.error("❌ Error:", err.message);
                return null;
            }
        }

        function updateVisualization(carbonIntensity) {
            const bar = document.getElementById('intensity-bar');
            const barValue = document.getElementById('bar-value');
            const gridStatus = document.getElementById('grid-status');
            const statusIndicator = document.querySelector('.status-indicator');
            
            // Calculate height percentage (0-800+ scale)
            const maxScale = 800;
            const heightPercent = Math.min((carbonIntensity / maxScale) * 100, 100);
            
            // Remove existing classes
            bar.classList.remove('low', 'average', 'high');
            statusIndicator.classList.remove('active', 'warning', 'danger');
            
            // Apply color coding based on intensity
            if (carbonIntensity <= 300) {
                bar.classList.add('low');
                statusIndicator.classList.add('active');
                gridStatus.textContent = 'Excellent';
            } else if (carbonIntensity <= 600) {
                bar.classList.add('average');
                statusIndicator.classList.add('warning');
                gridStatus.textContent = 'Moderate';
            } else {
                bar.classList.add('high');
                statusIndicator.classList.add('danger');
                gridStatus.textContent = 'High Impact';
            }
            
            // Update bar height and value
            bar.style.height = `${Math.max(heightPercent, 10)}%`;
            barValue.textContent = `${carbonIntensity} gCO₂/kWh`;
            
            // Update country comparison
            updateCountryComparison(currentCountry, carbonIntensity);
            updateCountryDateTime(currentCountry);
        }

        function updateCountryComparison(countryCode, intensity) {
            const countryIntensityElement = document.getElementById(`${countryCode.toLowerCase()}-intensity`);
            if (countryIntensityElement) {
                countryIntensityElement.textContent = `${intensity} gCO₂/kWh`;
                
                // Update color class
                countryIntensityElement.classList.remove('low', 'average', 'high');
                if (intensity <= 300) {
                    countryIntensityElement.classList.add('low');
                } else if (intensity <= 600) {
                    countryIntensityElement.classList.add('average');
                } else {
                    countryIntensityElement.classList.add('high');
                }
            }
        }

        function switchCountry(countryCode) {
            currentCountry = countryCode;
            
            // Update active tab
            document.querySelectorAll('.country-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelector(`[data-country="${countryCode}"]`).classList.add('active');
            
            // Update current country card
            document.querySelectorAll('.country-card').forEach(card => {
                card.classList.remove('current');
            });
            
            // Update title
            const title = document.querySelector('.title');
            const countryInfo = countryData[countryCode];
            title.textContent = `${countryInfo.flag} ${countryInfo.name} Carbon Monitor`;
            
            // Load default data for the country
            updateVisualization(countryInfo.defaultIntensity);
            
            // Update data display with default values
            document.getElementById('carbon-intensity').textContent = `${countryInfo.defaultIntensity} gCO₂/kWh`;
        }

        const button = document.getElementById("callBtn");
        const tooltip = document.getElementById('tooltip');

        async function displayData() {
            const carbonElement = document.getElementById("carbon-intensity");
            const dateElement = document.getElementById("date");
            const timeElement = document.getElementById("time");
            
            // Show loading state
            button.disabled = true;
            button.textContent = 'Loading...';
            button.classList.add('loading');
            
            carbonElement.textContent = 'Fetching data...';
            dateElement.textContent = 'Loading...';
            timeElement.textContent = 'Loading...';
            
            const data = await getCarbonData();
            console.log(data);

            if(data) {
                carbonElement.textContent = data.carbonIntensityText;
                dateElement.textContent = data.date;
                timeElement.textContent = data.time;
                
                // Update the visualization
                updateVisualization(data.carbonIntensity);
            } else {
                carbonElement.textContent = "372gCO₂/kWh";
                dateElement.textContent = getCurrentDateTime().date;
                timeElement.textContent = getCurrentDateTime().time;
                
                // Set error state
                const statusIndicator = document.querySelector('.status-indicator');
                const gridStatus = document.getElementById('grid-status');
                statusIndicator.classList.remove('active', 'warning');
                statusIndicator.classList.add('danger');
                gridStatus.textContent = 'Poor';
            }
            
            // Reset button state
            button.disabled = false;
            button.textContent = 'Refresh Data';
            button.classList.remove('loading');
        }

        // Tooltip functionality
        const intensityBar = document.getElementById('intensity-bar');
        
        intensityBar.addEventListener('mouseenter', (e) => {
            const carbonValue = document.getElementById('bar-value').textContent;
            const gridStatus = document.getElementById('grid-status').textContent;
            
            tooltip.innerHTML = `
                <strong>Current Reading:</strong><br>
                ${carbonValue}<br>
                <strong>Grid Status:</strong> ${gridStatus}<br>
                <small>Click for more details</small>
            `;
            tooltip.style.opacity = '1';
        });
        
        intensityBar.addEventListener('mousemove', (e) => {
            tooltip.style.left = e.pageX + 10 + 'px';
            tooltip.style.top = e.pageY - 10 + 'px';
        });
        
        intensityBar.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });

        // Click event for refresh button
        button.addEventListener("click", () => {
            displayData();
            
        });

        // Country tab click events
        document.querySelectorAll('.country-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const countryCode = e.target.getAttribute('data-country');
                switchCountry(countryCode);
            });
        });

        // Update time every minute for all countries
        setInterval(updateAllCountriesDateTime, 60000);

        // Initialize with default data and current time
        updateVisualization(580);
        updateAllCountriesDateTime();
    