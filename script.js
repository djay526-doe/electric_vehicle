// --- Configuration Constants for the Empirical Model ---
const BASE_CONSUMPTION_WH_KM = 150; // Base Wh/km consumption for an efficient EV
const WEIGHT_PENALTY_COEFFICIENT = 0.015; // Additional Wh/km consumption per kg

// --- DOM Element References ---
const batteryInput = document.getElementById('batteryCapacity');
const weightInput = document.getElementById('curbWeight');
const conditionSlider = document.getElementById('conditionFactor');
const conditionLabel = document.getElementById('conditionLabel');
const resultBox = document.getElementById('resultBox');
const predictedRangeSpan = document.getElementById('predictedRange');
const efficiencyInfo = document.getElementById('efficiencyInfo');
const predictButton = document.getElementById('predictButton');

/**
 * Function to update the slider label text and color based on the factor value.
 */
function updateConditionLabel() {
    const factor = parseFloat(conditionSlider.value);
    let labelText = '';
    let labelColor = 'text-blue-400';

    if (factor <= 0.8) {
        labelText = 'Aggressive Driving/Severe Cold';
        labelColor = 'text-red-400';
    } else if (factor <= 0.95) {
        labelText = 'Moderate Cold/Highway Speed';
        labelColor = 'text-yellow-400';
    } else if (factor <= 1.05) {
        labelText = 'Mild Conditions/Mixed Driving';
        labelColor = 'text-green-400';
    } else {
        labelText = 'Ideal Conditions/Eco Driving';
        labelColor = 'text-teal-400';
    }
    conditionLabel.textContent = `${labelText} (${(factor * 100).toFixed(0)}% Eff.)`;
    conditionLabel.className = `float-right font-medium ${labelColor}`;
}

/**
 * Calculates the predicted range based on empirical formula.
 * Range = (Capacity * 1000) / (Consumption) * Condition Factor
 */
function predictRange() {
    // Disable button during calculation for visual feedback
    predictButton.disabled = true;
    predictButton.textContent = 'Calculating...';

    // Simulate slight delay for professional feel
    setTimeout(() => {
        const capacity = parseFloat(batteryInput.value);
        const weight = parseFloat(weightInput.value);
        const conditionFactor = parseFloat(conditionSlider.value);

        // Input validation
        if (isNaN(capacity) || capacity <= 0 || isNaN(weight) || weight <= 0) {
            predictedRangeSpan.textContent = '---';
            efficiencyInfo.textContent = 'Please enter valid numbers.';
            resultBox.classList.remove('block');
            resultBox.classList.add('hidden');
            predictButton.disabled = false;
            predictButton.textContent = 'Calculate Range';
            return;
        }

        // 1. Calculate Base Consumption (Wh/km) based on vehicle weight
        const totalConsumptionWhKm = BASE_CONSUMPTION_WH_KM + (weight * WEIGHT_PENALTY_COEFFICIENT);
        
        // 2. Calculate Unadjusted Range (km)
        const capacityWh = capacity * 1000;
        const unadjustedRange = capacityWh / totalConsumptionWhKm;
        
        // 3. Apply Condition Factor
        const finalRange = unadjustedRange * conditionFactor;
        
        // 4. Update the UI
        predictedRangeSpan.textContent = Math.round(finalRange);
        
        // Calculate and show the effective efficiency including the factor
        const effectiveConsumption = capacityWh / finalRange;
        efficiencyInfo.textContent = `Effective Consumption: ${effectiveConsumption.toFixed(0)} Wh/km`;

        resultBox.classList.remove('hidden');
        resultBox.classList.add('block');
        
        // Re-enable button
        predictButton.disabled = false;
        predictButton.textContent = 'Calculate Range';
    }, 300); // 300ms delay
}

/**
 * Initialize the application on page load and set up event listeners.
 */
document.addEventListener('DOMContentLoaded', () => {
    updateConditionLabel();
    
    // Listen for button click
    predictButton.addEventListener('click', predictRange);
    
    // Listen for input changes for dynamic updates
    batteryInput.addEventListener('input', predictRange);
    weightInput.addEventListener('input', predictRange);
    conditionSlider.addEventListener('input', updateConditionLabel); // Update label immediately on slide
    conditionSlider.addEventListener('change', predictRange); // Update prediction when sliding stops
    
    predictRange(); // Run initial prediction on page load
});