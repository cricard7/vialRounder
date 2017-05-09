/*

FACTORY

myApp.factory("item", function(){
	return function (prop1, prop2) {
		return{
			prop1: prop1,
			prop2: prop2
		}
	}
	
});

var factoryTestController;

factoryTestController = function($scope, $log, item){
	
	var objectOne = new item("Large", "InCharge");
	var objectTwo = new item("small", "notincharge");
	
	$scope.o1p1 = objectOne.prop1;
	$scope.o1p2 = objectOne.prop2;
	$scope.o2p1 = objectTwo.prop1;
	$scope.o2p2 = objectTwo.prop2;

};


NEED to reference in index.html, make combo factory and add dependency injection
*/



(function () {

    angular

        .module('myApp')
        .factory("tableFactory", [function () {

// returning a function factory (from the angular factory). Therefor must call new on the angular factory function call.             
              return function Table(roundPercent, roundMethod, SVialSize, LVialSize, maxKgOrM2, dosePerUnit, dispensedData, productCostPerMg) {
                    /**********************************************************************************************************************
                     ***************************************   PROPERTIES   ***********************************************
                     *********************************************************************************************************************/

                    var allCombos = []; // array with all combinations of vials comprised of combo objects
                    var roundVal = 1 - roundPercent;
                    /* roundPercent is expected to be a number between 0-1 eg. 0.1 = round within 10% */
                    var duplicates = []; // array containing all duplicate combo values - for test purposes
                    var totalWasteMg = 0;
                    var costTotalWaste = 0;
                    var totalMgReducedByRounding = 0;
                    var numDosesInRoundRange = 0;
                    var savingsByRounding = 0;
                    var actualCostToListCostRatio = 0;
                    var totalMgOfAllDispensedDoses = 0;
                    var numDosesRoundedUp = 0; // used for method C to indicate how many doses are rounded up. (how often this occurs).

                    this.getNumDosesRoundedUp = function () {
                        return numDosesRoundedUp;
                    };

                    this.productCostPerMg = productCostPerMg;
                    this.dispensedData = dispensedData; // array of doses dispensed. Used to calculate cost savings of each round method.
                    this.getTotalWasteMg = function () {
                        return totalWasteMg;
                    }; //For given dispensed dataset, how much mg total would have been discarded (ie not given to patient) - ignores rounding.
                    this.getCostTotalWaste = function () {
                        return costTotalWaste;
                    };
                    this.getActualCostToListCostRatio = function () {
                        return actualCostToListCostRatio;
                    }; // An indicator of a round strategy effectiveness for a given dataset input. Calculated as:
                    // [(totalMgOfAllDispensedDoses + totalWasteMg) * productCostPerMg] / (totalMgOfAllDispensedDoses * productCostPerMg)

                    this.getSavingsByRounding = function () {
                        return savingsByRounding;
                    };
                    this.getTotalMgOfAllDispensedDoses = function () {

                        return totalMgOfAllDispensedDoses;
                    };

                    this.totalAmountWasteReducedByRounding; //counter for the num mg that are discarded (ie not given to a patiet) for input dataset of doses
                    //that fall within a rounding range of a combo. May not need this number

                    this.getTotalMgReducedByRounding = function () {
                        return totalMgReducedByRounding;
                    }; // counter for the total mg that could be saved by implementing round for input dataset of doses.
                    //used to calculate cost savings of a round strategy
                    this.getNumDosesInRoundRange = function () {
                        return numDosesInRoundRange;
                    };

                    this.totalNumDosesInRoundingRanges; // for given dataset, how many of those doses fall within rounding ranges ie are affected by round rule.

                    this.totalCostSavingByRounding; // for given dataset, how much money would have been saved if round was in place.
                    //totalMgReducedByRounding * costPerMg

                    this.getAllCombos = function () {
                        return allCombos;
                    };
                    this.getDuplicates = function () {
                        return duplicates;
                    };


                    /* *********************************************************************************************************************
                     **************************************      METHODS    ***************************************************************
                     *********************************************************************************************************************/




                    // to create a new combination of vials and associated data

                    var createCombo = function (SVialSize, LVialSize, numSVial, numLVial) {
                        // Combo represents a combination of vials and all data associated with it.

                        return {

                            SVialSize: SVialSize, //Smaller vial size mg
                            LVialSize: LVialSize, //Larger vial size mg
                            numSVial: numSVial, // number of small vials to make combo
                            numLVial: numLVial, // number of large vials to make combo
                            //doseInMg: doseInMg, // total mg dose of the combination of vials
                           // lowerRoundValue: lowerRoundValue, //the lower value in mg that would be rounded to the doseInMg (ie this combo)
                           // upperRoundValue: upperRoundValue, //the upper value in mg that would be rounded to the doseInMg (ie this combo)
                          //  posVariance: posVariance, // the percentage difference of the lowerRoundValue vs doseInMg (doseInMg / lowerRoundValue)X100 ie. how much more dose is given (max) by rounding to the doseInMg of this combo
                         //   negVariance: negVariance, // the percentage difference of the upperRoundValue vs doseInMg (doseInMg / upperRoundValue)X100 ie. how much less dose is given (max) by rounding to the doseInMg of this combo
                        //    m2OrKgLowerValue: m2OrKgLowerValue, //dosing weight or BSA represented by the lowerRoundValue (lowerRoundValue / dosePerUnit)
                        //    m2OrKgUpperValue: m2OrKgUpperValue,
                         //   amountWasteReducedByRound: amountWasteReducedByRound, //cumulative total of mg (from a set of doses) that are wasted within the range of this combination of vials.
                            //1. Doses that are above  [doseInMg] but are less than upperRoundValue: Waste = (next combination up doseInMg - dose in dataset)
                            //2. Doses that are below [doseInMg] but are greater than lowerRoundValue: Waste = (this combos doseInMg - dose in dataset)
                            //Keeps track of the actual mg that would be discarded after dispensing a dose in a dataset, but could have been prevented by the round
                            //Is this number useful? It doesn't correlate to cost savings and cannot occur without also reducing the dose down, in which case
                            //amountTotalMgReducedByRound is the actual number needed to tell round method effectiveness.
                            amountTotalMgReducedByRound: 0, //cumulative total of mg (from a set of doses) that is saved (both drug waste + dose that is rounded down)
                            // calculated for doses that fall between doseInMg and upperRoundValue. AmoungMgReduced = (next combo up doseInMg - currentCombo doseInMg)
                            // note that doses that would be rounded up to the doseInMg do not get added to this value because there is no cost saving generated by doing this.
                            numDoses: 0, // counter to keep track of then number of times a dose within dataset falls within round range of this combination of vials
                            dollarsSavedByRound: 0 // amountTotalMgReducedByRound * dollarCostPerMg


                        }

                    }



                    //Methods that operate on the dataset of doses dispensed

                    function howMuchDispensedInMg() {
                        // totals the sum of all doses dispensed
                        for (var a = 0; a < dispensedData.length; a++) {

                            totalMgOfAllDispensedDoses += dispensedData[a];
                        }

                    };



                    //Rounding methods act on Each combo in the allCombos array to set the lower and upper round values


                    // method A of rounding rounds down within x percentage to the lowest possible combo size
                    function setLowerRoundValueMethodA(index) {


                        var currentCombo = allCombos[index];
                        var nextCombo = allCombos[index + 1];

                        if (index > 0) {
                            var prevCombo = allCombos[index - 1];
                        }
                        // first consider if this is the first vial in series
                        if (index == 0) {
                            currentCombo.lowerRoundValue = currentCombo.SVialSize;
                        }
                        // test if the previous Combos range is above current combos dose
                        else if (prevCombo.upperRoundValue >= currentCombo.doseInMg) {

                            currentCombo.lowerRoundValue = prevCombo.upperRoundValue + 0.001;
                        }
                        // if the previous combo's upperround value is less than current dose
                        else if (prevCombo.upperRoundValue < currentCombo.doseInMg) {
                            currentCombo.lowerRoundValue = currentCombo.doseInMg;
                        }

                    }

                    function setUpperRoundValueMethodA(index) {
                        var currentCombo = allCombos[index];

                        currentCombo.upperRoundValue = (currentCombo.doseInMg / roundVal);

                    }


                    // method B of rounding rounds down within x percentage to the next nearest vial size
                    function setLowerRoundValueMethodB(index) {
                        var currentCombo = allCombos[index];

                        currentCombo.lowerRoundValue = currentCombo.doseInMg;

                    }

                    function setUpperRoundValueMethodB(index) {
                        var currentCombo = allCombos[index];
                        var nextCombo = allCombos[index + 1];


                        // if on the last item in the array - instead of setting its upper val - assign value "undetermined"

                        if (index == allCombos.length - 1) {
                            currentCombo.upperRoundValue = "undetermined";
                        } else {
                            // determine if the which is larger, the next combos dose or this combos calculated upperRound Value. Take the lesser of the two


                            if (nextCombo.doseInMg > (currentCombo.doseInMg / roundVal)) {
                                currentCombo.upperRoundValue = currentCombo.doseInMg / roundVal;
                            } else {
                                currentCombo.upperRoundValue = nextCombo.doseInMg - 0.001;
                            }

                        }
                    }


                    // method C of rounding rounds up or down to the nearest vial size as long as it is within x percentage.
                    function setLowerRoundValueMethodC(index) {

                        //two scenarios 1. x% of combo is >  half way to lower (previous) combo value -> cap round at x%
                        //2. x% of combo is <= 50% way to previos combo value -> set lower round to difference between current and prev val / 2
                        var currentCombo = allCombos[index];
                        var testLowerRange = (currentCombo.doseInMg / (1 + roundPercent));
                        var prevCombo;
                        var doseHalfWayToLowerCombo;
                        if (index > 0) {
                            prevCombo = allCombos[index - 1];
                            doseHalfWayToLowerCombo = (prevCombo.doseInMg + ((currentCombo.doseInMg - prevCombo.doseInMg) / 2));
                        }

                        //consider this is the first combo in the series
                        if (index == 0) {

                            currentCombo.lowerRoundValue = testLowerRange;
                        } else if (testLowerRange > doseHalfWayToLowerCombo) {
                            currentCombo.lowerRoundValue = testLowerRange;

                        } else {
                            // testLowerRange must be equal to at least half way to the next lower combo, so cap at half way to lower combo
                            currentCombo.lowerRoundValue = doseHalfWayToLowerCombo;

                        }


                    }

                    function setUpperRoundValueMethodC(index) {
                        //two scenarios 1. x% of combo is <  half way to next combo value -> cap round at x%
                        //2. x% of combo is >= 50% way to next combo value -> set lower round to difference between current and prev val / 2
                        var currentCombo = allCombos[index];
                        var testUpperRange = (currentCombo.doseInMg / roundVal);
                        var nextCombo;
                        var doseHalfWaytoUpperCombo
                        if (index < allCombos.length - 1) {
                            nextCombo = allCombos[index + 1];
                            doseHalfWaytoUpperCombo = (currentCombo.doseInMg + ((nextCombo.doseInMg - currentCombo.doseInMg) / 2));
                        }

                        //consider this is the last combo in the series
                        if (index == allCombos.length - 1) {
                            currentCombo.upperRoundValue = "undefined"
                        } else if (testUpperRange < doseHalfWaytoUpperCombo) {
                            currentCombo.upperRoundValue = testUpperRange;
                        } else {
                            //testUpperRange must be equal to or greater than half way to the next available combo dose, so cap at half way
                            currentCombo.upperRoundValue = doseHalfWaytoUpperCombo - 0.001;
                        }

                    }


                    //removes duplicate combos that have the same total dose, but different vial combos (most vials used is removed)
                    function removeDuplicates() {

                        //remove duplicates. Combinations that use the least number of vials will be left in list
                        // the combos that are removed are stored in the duplicates array for testing purposes


                        var nextCombo;
                        var currentCombo;

                        var l = allCombos.length - 1;


                        while (l > 0) {
                            currentCombo = allCombos[l];
                            nextCombo = allCombos[l - 1];

                            if (currentCombo.doseInMg == nextCombo.doseInMg) {
                                // find which to remove which is one with the most vials
                                if ((currentCombo.numSVial + currentCombo.numLVial) > (nextCombo.numSVial + nextCombo.numLVial)) {

                                    // store the item to be removed in the duplicates array and then remove it from allCombos array
                                    duplicates.push(currentCombo);
                                    allCombos.splice(l, 1);

                                } else if ((currentCombo.numSVial + currentCombo.numLVial) < (nextCombo.numSVial + nextCombo.numLVial)) {

                                    // store the item to be removed in the duplicates array and then remove it from allCombos array
                                    duplicates.push(nextCombo);
                                    allCombos.splice(l - 1, 1);

                                }

                            }

                            l--;

                        }


                    }


                    //calc pos and neg variance values
                    function calcPosVariance() {
                        // the percentage difference of the lowerRoundValue vs doseInMg (doseInMg / lowerRoundValue)X100 ie. how much more dose is given (max) by rounding to the doseInMg of this combo


                        var currentCombo;


                        for (var i = 0; i < allCombos.length; i++) {

                            currentCombo = allCombos[i];

                            if (currentCombo.doseInMg > currentCombo.lowerRoundValue) {
                                currentCombo.posVariance = ((currentCombo.doseInMg / currentCombo.lowerRoundValue) * 100) - 100;

                            } else {
                                currentCombo.posVariance = 0;
                            }

                        }
                    }

                    function calcNegVariance() {
                        // the percentage difference of the upperRoundValue vs doseInMg (doseInMg / upperRoundValue)X100 ie. how much less dose is given (max) by rounding to the doseInMg of this combo

                        var currentCombo;


                        for (var i = 0; i < allCombos.length; i++) {

                            currentCombo = allCombos[i];

                            if (currentCombo.doseInMg < currentCombo.upperRoundValue) {

                                currentCombo.negVariance = ((currentCombo.doseInMg / currentCombo.upperRoundValue) * 100) - 100;
                            } else {
                                currentCombo.negVariance = 0;
                            }
                        }

                    }


                    //calc weights or BSA associated with each combo lower and upper value
                    function calcLowerKgORBsa() {

                        var currentCombo;


                        for (var i = 0; i < allCombos.length; i++) {

                            currentCombo = allCombos[i];

                            currentCombo.m2OrKgLowerValue = currentCombo.lowerRoundValue / dosePerUnit;

                        }
                    }

                    function calcUpperKgORBsa() {
                        var currentCombo;


                        for (var i = 0; i < allCombos.length; i++) {

                            currentCombo = allCombos[i];

                            currentCombo.m2OrKgUpperValue = currentCombo.upperRoundValue / dosePerUnit;

                        }
                    }

                    //generate list of all possible combinations of vials if two vial sizes or list of available combos if one vial size. Populates allCombos Array.
                    function genBasicArray() {

                        // if the larger vial size is set to zero, then run a seperate loop to generate table based on only small vial sizes


                        var maxComboSize; //define the largest combo size to calculate for


                        if (LVialSize != 0) {

                            var i = 0; // small Vial num
                            var j = 0; // large vial num
                            maxComboSize = (maxKgOrM2 * dosePerUnit);
                            var totalComboDose = 0;
                            var aNewCombo;


                            // continue to add vials until total dose exceeds the doses reasonable expected amount based on a max weight or BSA

                            while (totalComboDose < maxComboSize) {

                                while (totalComboDose < maxComboSize) {


                                    i++;
                                    totalComboDose = (i * SVialSize) + (j * LVialSize);

                                    if (totalComboDose <= maxComboSize) {
                                        aNewCombo = createCombo(SVialSize, LVialSize, i, j);
                                        allCombos.push(aNewCombo);
                                    }
                                }

                                //reset the value of smaller values and add larger vials
                                i = 0;

                                j++;
                                totalComboDose = (i * SVialSize) + (j * LVialSize);

                                if (totalComboDose <= maxComboSize) {
                                    aNewCombo = createCombo(SVialSize, LVialSize, i, j);
                                    allCombos.push(aNewCombo);
                                }

                            }
                        }

                        //else generate table based only on one vial size (small Vial Size)
                        else {

                            var k = 0; // small / only vial size

                            while ((SVialSize * k) < ((maxKgOrM2 * dosePerUnit) + (SVialSize))) {

                                k++;

                                aNewCombo = createCombo(SVialSize, LVialSize, k, 0);
                                allCombos.push(aNewCombo);
                            }

                        }

                    }


                    //for a given dose input, find the combo which has a range that the dose falls within. Can return index of combo or -1 if not within a range.
                    function doseWithinComboRange(doseToCheck) {

                        var currentCombo;
                        var indexReturn;

                        for (var i = 0; i < allCombos.length; i++) {
                            currentCombo = allCombos[i];

                            if (doseToCheck >= currentCombo.lowerRoundValue && doseToCheck <= currentCombo.upperRoundValue) {
                                return indexReturn = i;
                            } else {
                                indexReturn = -1;
                            }
                        }
                        return indexReturn;
                    }

                    //for a given dose input, find which combination of vials would be needed to dispense the dose. Used to calc waste.Returns combo Index.
                    function comboNeededToDispenseDose(doseToCheck) {

                        var currentCombo;
                        var nextCombo;
                        var indexReturn;
                        var i = 0;
                        var notFound = true;

                        while (notFound) {

                            currentCombo = allCombos[i];

                            // need to test condition if the first vial combo can dispense dose, then stop
                            if (i == 0 && currentCombo.doseInMg >= doseToCheck) {
                                indexReturn = 0;
                                notFound = false;
                                return indexReturn;
                            }
                            // see if at the end of the array of doses dispensed, if not then set the next combo
                            if (i < allCombos.length - 1) {
                                nextCombo = allCombos[i + 1];
                            } else {
                                alert("dose: " + doseToCheck + " is too large to calc Waste- Suggest increasing max Dose Unit to increase table size  (combos in table not sufficent to dispense dose: see cTables.js)_ - comboNeededToDispenseDose()");
                            }

                            // see if current combo can dispense dose exactly. If  so then return that dose.

                            if (doseToCheck == currentCombo.doseInMg) {
                                // found it.
                                indexReturn = i;
                                notFound = false;
                                return indexReturn;
                            }

                            if (doseToCheck > currentCombo.doseInMg) {

                                // check to see if the next dose would be able to dispense dose. If at end of array, then display alert dose is too large to calc waste
                                if (i == allCombos.length - 1) {
                                    alert("dose: " + doseToCheck + " is too large to calc Waste - Suggest increasing max Dose Unit to increase table size (combos in table not sufficent to dispense dose: see cTables.js) - comboNeededToDispenseDose()");
                                } else if (doseToCheck < nextCombo.doseInMg) {
                                    // found it.
                                    indexReturn = i + 1;
                                    notFound = false;
                                }
                            }
                            i++;
                        }
                        return indexReturn;
                    }


                    //calculate the total amount of waste based on input dataset. Sets the totalWasteMg prop of table.

                    function totalWasteFromDataSet() {

                        var indexOfComboNeededToDispense;
                        var requiredCombo;

                        for (var i = 0; i < dispensedData.length; i++) {

                            indexOfComboNeededToDispense = comboNeededToDispenseDose(dispensedData[i]);
                            requiredCombo = allCombos[indexOfComboNeededToDispense];

                            totalWasteMg += (requiredCombo.doseInMg - dispensedData[i]);

                        }


                    }

                    // calc the dollar value of total waste
                    function calcCostTotalWaste() {

                        costTotalWaste = totalWasteMg * productCostPerMg;
                    }

                    //for each combo in the all combos array, set the doseInMg property
                    function setTotalDoseOfCombos() {
                        var currentCombo;
                        for (var k = 0; k < allCombos.length; k++) {

                            currentCombo = allCombos[k];
                            currentCombo.doseInMg = (currentCombo.SVialSize * currentCombo.numSVial) + (currentCombo.LVialSize * currentCombo.numLVial);
                        }
                    }

                    //set the totalMgReducedByRounding property. Equal to the reduction of waste not dispensed to patient plus the amount saved from rounding down
                    //to the dose in mg for each entry in the dispensed data dataset.
                    //Also keeps track of total number of doses that fall within all ranges in table and each individual combo.
                    //And totalMgReduced by each combo

                    function amountTotalMgReducedByRound() {

                        //for each dispensed dose,
                        //doses that fall between doseInMg and upperRoundValue. AmoungMgReduced = (next combo up doseInMg - currentCombo doseInMg)
                        // note that doses that would be rounded up to the doseInMg do not get added to this value because there is no cost saving generated by doing this.

                        var dispensedDose;
                        var amountMgReduced = 0;
                        var requiredComboForDose;
                        var roundedComboDose;

                        //for each dispended dose, check if the dispensed dose falls within a range. If so then calculate AmountMgReduced and add to total. Also update
                        //the number of doses that fall within the range



                        // For each dose in dispensed doses
                        //1. Check that it falls within a combo Range (ie can be rounded)
                        //2. Check which combo would be needed to dispense that dose without rounding (A)
                        //3. Which combo's range does it fall within (B)
                        //4. Subtract A - B to get totalMgReduced
                        //5. Remember to increment how many doses fall within round range for table and for combo.
                        //   if a dose is dispensed by a boarderline value eg 100 mg from a 100 mg vial, then do not include in increment, but if otherwise between otherwise between lower and upper range vals, increase.
                        //6. Check if the dose was rounded up (amountMgReduced = 0 && dispensedDose < requiredComboForDose.doseInMg) . If so add to tally (numDosesRoundedUp)
                        //7. Assign totalMgReduced to the current Combo and to the table total

                        for (var i = 0; i < dispensedData.length; i++) {
                            dispensedDose = dispensedData[i];
                            //#1
                            if (doseWithinComboRange(dispensedDose) != -1) {
                                //#2
                                requiredComboForDose = allCombos[comboNeededToDispenseDose(dispensedDose)];
                                //#3
                                roundedComboDose = allCombos[doseWithinComboRange(dispensedDose)];
                                //#4
                                amountMgReduced = requiredComboForDose.doseInMg - roundedComboDose.doseInMg;

                                //#5
                                if (dispensedDose >= roundedComboDose.lowerRoundValue && dispensedDose <= roundedComboDose.upperRoundValue && dispensedDose != roundedComboDose.doseInMg) {
                                    roundedComboDose.numDoses += 1;
                                    numDosesInRoundRange++;

                                    // log round downs only
                                    if (dispensedDose > roundedComboDose.doseInMg) {
                                        console.log("method: " + roundMethod + " Dispensed Dose: " + dispensedDose + "Round to: " + roundedComboDose.doseInMg);
                                    }
                                }
                                //#6
                                if (dispensedDose < roundedComboDose.doseInMg) {

                                    console.log("method: " + roundMethod + " Dispensed Dose: " + dispensedDose + "Round to: " + roundedComboDose.doseInMg);
                                    numDosesRoundedUp += 1;

                                    console.log("Doses Rounded Up: " + numDosesRoundedUp);
                                }

                                //#7
                                roundedComboDose.amountTotalMgReducedByRound += amountMgReduced;
                                totalMgReducedByRounding += amountMgReduced;

                                //Test for dose of 1000

                                if (dispensedDose == 1000) {
                                    alert("dose is 1000" + " Method: " + roundMethod + " mgReduced: " + amountMgReduced + " Rounded to: " + roundedComboDose.doseInMg);
                                }

                                //reset amountMgReduced local var
                                amountMgReduced = 0;
                            }
                        }



                    }


                    function costSavingByRounding() {

                        savingsByRounding = productCostPerMg * totalMgReducedByRounding;

                    }

                    // set the dollarsSavedByRound Property of each combo based off of total mg Reduced by Range Value
                    function dollarsSavedByEachCombo() {

                        var currentCombo;
                        for (var l = 0; l < allCombos.length; l++) {

                            currentCombo = allCombos[l];
                            currentCombo.dollarsSavedByRound = currentCombo.amountTotalMgReducedByRound * productCostPerMg;
                        }
                    }


                    //Generate the allCombos array and sets some of the variable of the combos which it contains

                    function generateAllCombosArray() {

                        // generate a list of combos and sort by size

                        genBasicArray();


                        // set the total dose of each element in the array.

                        setTotalDoseOfCombos();

                        // sort allCombos array in ascending order by total dose

                        allCombos.sort(function (a, b) {
                            return a.doseInMg - b.doseInMg
                        });


                        // remove duplicate combo values


                        removeDuplicates();


                        //set the lower and upper round value depending on the rounding method requested. See method definitions in roundMethod functions.
                        if (roundMethod == "a") {
                            for (var m = 0; m < allCombos.length; m++) {

                                setLowerRoundValueMethodA(m);
                                setUpperRoundValueMethodA(m);
                            }

                        } else if (roundMethod == "b") {

                            for (var n = 0; n < allCombos.length; n++) {

                                setLowerRoundValueMethodB(n);
                                setUpperRoundValueMethodB(n);
                            }

                        }

                        //Method c - round the dose either up or down within x percent to the nearest vial size.
                        //method starts at the bottom of the list and moves up to larger vial combos.
                        //
                        else if (roundMethod == "c") {

                            for (var o = 0; o < allCombos.length; o++) {

                                setLowerRoundValueMethodC(o);
                                setUpperRoundValueMethodC(o);
                            }
                        }

                        // calculate the positive and negative variances of each combo line

                        calcPosVariance();
                        calcNegVariance();

                        // calculate weight or BSA associated with each combos range

                        calcLowerKgORBsa();
                        calcUpperKgORBsa();

                        // calculate the total waste and its cost ()

                        totalWasteFromDataSet();
                        calcCostTotalWaste();


                        // Calculate total amount of medication saved (reduced) by rounding method. Includes wasted amount plus the amount rounded down.

                        amountTotalMgReducedByRound();

                        // calc cost saving by rounding

                        costSavingByRounding();

                        // Set the total dollarsSavedByRound property of each combo

                        dollarsSavedByEachCombo();

                        // calc totaldispensedmg for the input dataset of dispensed doses

                        howMuchDispensedInMg();



                    };


                    /* END of generateAllCombosArray */

                    // generate the tables once the Tables object is created
                    generateAllCombosArray();
                };



	}



	]);









}());
