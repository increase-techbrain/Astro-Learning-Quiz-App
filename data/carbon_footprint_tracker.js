


        // Emission factors for Nigerian context (kg CO2 per unit)
        const emissionFactors = {
            transportation: {
                gasoline: 2.3, // kg CO2 per km (petrol car)
                okada: 0.08, // kg CO2 per km (motorcycle)
                diesel: 2.7, // kg CO2 per km (diesel car)
                bus: 0.5, // kg CO2 per km per passenger (danfo/bus)
                keke: 0.12, // kg CO2 per km (tricycle)
                flight: 250 // kg CO2 per hour (domestic flights)
            },
            energy: {
                electricity: {
                    grid: 0.6, // kg CO2 per kWh (Nigeria grid - mostly gas)
                    generator: 2.5, // kg CO2 per kWh (diesel generator)
                    solar: 0.05, // kg CO2 per kWh (solar)
                    mixed: 1.2 // kg CO2 per kWh (mixed sources)
                },
                generator: 2.68, // kg CO2 per litre of fuel
                cookingGas: 3.0 // kg CO2 per kg of LPG
            },
            diet: {
                'nigerian-mixed': 0.8, // kg CO2 per day
                'heavy-meat': 1.5, // kg CO2 per day
                'vegetarian': 0.4, // kg CO2 per day
                'fish-focused': 0.6 // kg CO2 per day
            },
            waste: 0.5 // kg CO2 per kg of waste
        };

        let currentTimeframe = 'monthly';
        let currentResults = {
            transportation: 0,
            energy: 0,
            diet: 0,
            waste: 0,
            total: 0
        };

        function updateTimeframeLabels() {
            currentTimeframe = document.getElementById('timeframe').value;
            
            const labels = {
                daily: {
                    carKm: 'Daily Car/Okada Distance (km):',
                    flights: 'Flight Hours Today:',
                    electricity: 'Daily Electricity (kWh):',
                    generator: 'Daily Generator Fuel (Litres):',
                    cookingGas: 'Daily Cooking Gas (kg):',
                    waste: 'Daily Waste (kg):',
                    title: 'Daily Emissions'
                },
                weekly: {
                    carKm: 'Weekly Car/Okada Distance (km):',
                    flights: 'Flight Hours This Week:',
                    electricity: 'Weekly Electricity (kWh):',
                    generator: 'Weekly Generator Fuel (Litres):',
                    cookingGas: 'Weekly Cooking Gas (kg):',
                    waste: 'Weekly Waste (kg):',
                    title: 'Weekly Emissions'
                },
                monthly: {
                    carKm: 'Monthly Car/Okada Distance (km):',
                    flights: 'Flight Hours This Month:',
                    electricity: 'Monthly Electricity (kWh):',
                    generator: 'Monthly Generator Fuel (Litres):',
                    cookingGas: 'Monthly Cooking Gas (kg):',
                    waste: 'Monthly Waste (kg):',
                    title: 'Monthly Emissions'
                }
            };

            const currentLabels = labels[currentTimeframe];
            document.getElementById('carKmLabel').textContent = currentLabels.carKm;
            document.getElementById('flightsLabel').textContent = currentLabels.flights;
            document.getElementById('electricityLabel').textContent = currentLabels.electricity;
            document.getElementById('generatorLabel').textContent = currentLabels.generator;
            document.getElementById('cookingGasLabel').textContent = currentLabels.cookingGas;
            document.getElementById('wasteLabel').textContent = currentLabels.waste;
            document.getElementById('totalEmissionsTitle').textContent = currentLabels.title;

            // Update placeholders based on timeframe
            const placeholders = {
                daily: { carKm: '15', electricity: '8', generator: '2', cookingGas: '0.5', flights: '0', waste: '2' },
                weekly: { carKm: '100', electricity: '50', generator: '15', cookingGas: '3', flights: '0', waste: '15' },
                monthly: { carKm: '400', electricity: '200', generator: '60', cookingGas: '12.5', flights: '2', waste: '60' }
            };

            const currentPlaceholders = placeholders[currentTimeframe];
            document.getElementById('carKm').placeholder = `e.g., ${currentPlaceholders.carKm}`;
            document.getElementById('electricity').placeholder = `e.g., ${currentPlaceholders.electricity}`;
            document.getElementById('generator').placeholder = `e.g., ${currentPlaceholders.generator}`;
            document.getElementById('cookingGas').placeholder = `e.g., ${currentPlaceholders.cookingGas}`;
            document.getElementById('flights').placeholder = `e.g., ${currentPlaceholders.flights}`;
            document.getElementById('waste').placeholder = `e.g., ${currentPlaceholders.waste}`;
        }

        function calculateFootprint() {
            // Get input values
            const carKm = parseFloat(document.getElementById('carKm').value) || 0;
            const carType = document.getElementById('carType').value;
            const flights = parseFloat(document.getElementById('flights').value) || 0;
            const electricity = parseFloat(document.getElementById('electricity').value) || 0;
            const generator = parseFloat(document.getElementById('generator').value) || 0;
            const cookingGas = parseFloat(document.getElementById('cookingGas').value) || 0;
            const energySource = document.getElementById('energySource').value;
            const diet = document.getElementById('diet').value;
            const waste = parseFloat(document.getElementById('waste').value) || 0;

            // Calculate transportation emissions
            const carEmissions = carKm * emissionFactors.transportation[carType];
            const flightEmissions = flights * emissionFactors.transportation.flight;
            const transportationTotal = carEmissions + flightEmissions;

            // Calculate energy emissions
            const electricityEmissions = electricity * emissionFactors.energy.electricity[energySource];
            const generatorEmissions = generator * emissionFactors.energy.generator;
            const gasEmissions = cookingGas * emissionFactors.energy.cookingGas;
            const energyTotal = electricityEmissions + generatorEmissions + gasEmissions;

            // Calculate diet emissions (adjust for timeframe)
            let dietMultiplier = 1;
            if (currentTimeframe === 'daily') dietMultiplier = 1;
            else if (currentTimeframe === 'weekly') dietMultiplier = 7;
            else if (currentTimeframe === 'monthly') dietMultiplier = 30;
            
            const dietEmissions = emissionFactors.diet[diet] * dietMultiplier;

            // Calculate waste emissions
            const wasteEmissions = waste * emissionFactors.waste;

            // Update results
            currentResults = {
                transportation: transportationTotal,
                energy: energyTotal,
                diet: dietEmissions,
                waste: wasteEmissions,
                total: transportationTotal + energyTotal + dietEmissions + wasteEmissions
            };

            // Display results
            displayResults();
            updateTips();
        }

        function displayResults() {
            // Update total emissions
            document.getElementById('totalEmissions').textContent = currentResults.total.toFixed(1);

            // Update breakdown
            const breakdown = document.getElementById('breakdown');
            breakdown.innerHTML = `
                <div class="breakdown-item">
                    <span class="category-name">🚗 Transportation</span>
                    <span class="amount">${currentResults.transportation.toFixed(1)} kg</span>
                </div>
                <div class="breakdown-item">
                    <span class="category-name">⚡ Energy</span>
                    <span class="amount">${currentResults.energy.toFixed(1)} kg</span>
                </div>
                <div class="breakdown-item">
                    <span class="category-name">🍽️ Diet</span>
                    <span class="amount">${currentResults.diet.toFixed(1)} kg</span>
                </div>
                <div class="breakdown-item">
                    <span class="category-name">🗑️ Waste</span>
                    <span class="amount">${currentResults.waste.toFixed(1)} kg</span>
                </div>
            `;

            // Add animation to results
            const resultsSection = document.getElementById('results');
            resultsSection.style.opacity = '0';
            resultsSection.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                resultsSection.style.transition = 'all 0.5s ease';
                resultsSection.style.opacity = '1';
                resultsSection.style.transform = 'translateY(0)';
            }, 100);
        }

        function updateTips() {
            const tips = [];
            
            if (currentResults.transportation > 50) {
                tips.push("Consider using Keke NAPEP or Danfo for shorter distances instead of personal car");
                tips.push("Try carpooling or using ride-sharing apps like Bolt/Uber for longer trips");
                tips.push("Walk or use bicycle for very short distances within your area");
            }
            
            if (currentResults.energy > 30) {
                tips.push("Reduce generator usage - try to maximize NEPA hours for heavy appliances");
                tips.push("Switch to energy-efficient LED bulbs and appliances");
                tips.push("Consider solar panels for basic lighting and phone charging");
                tips.push("Use your generator efficiently - run multiple appliances together");
            }
            
            if (currentResults.diet > 20) {
                tips.push("Try occasional 'meatless days' with more beans, plantain, and vegetables");
                tips.push("Choose more fish and chicken over red meat when possible");
                tips.push("Buy local produce from nearby markets to reduce transportation emissions");
            }
            
            if (currentResults.waste > 10) {
                tips.push("Separate organic waste for composting in your garden");
                tips.push("Reuse plastic containers and bags multiple times");
                tips.push("Buy items with less packaging from local markets");
            }

            // Add Nigeria-specific general tips
            tips.push("Use rechargeable lanterns instead of candles during power outages");
            tips.push("Service your generator regularly for better fuel efficiency");
            tips.push("Use clay pots to keep water cool instead of refrigeration");
            tips.push("Plant trees around your compound to reduce air conditioning needs");

            const tipsList = document.getElementById('tipsList');
            tipsList.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
        }

        // Initialize with example calculation
        window.onload = function() {
            updateTimeframeLabels();
            document.getElementById('carKm').value = '400';
            document.getElementById('electricity').value = '200';
            document.getElementById('generator').value = '60';
            document.getElementById('cookingGas').value = '12.5';
            document.getElementById('flights').value = '0';
            document.getElementById('waste').value = '60';
            calculateFootprint();
        };