

(function(){
	
angular

	.module('myApp')
	.controller('mainController', ["tableFactory", mainController]);


		
    function mainController(tableFactory) {

				var vm = this;	
			
        vm.tableFilterOptions = ["Recommendation", "Diagnostic", "Economic"];
        vm.tableFilter = "Recommendation";
        vm.showTables;

        vm.TableA;
        vm.allCombosTableA;
        vm.totalMgReducedByRoundA;
        vm.totalSavingsRoundA;
        vm.numDosesInTableA;


        vm.TableB;
        vm.allCombosTableB;
        vm.totalMgReducedByRoundB;
        vm.totalSavingsRoundB;
        vm.numDosesInTableB;


        vm.TableC;
        vm.allCombosTableC;
        vm.totalMgReducedByRoundC;
        vm.totalSavingsRoundC;
        vm.numDosesInTableC;
	

        // for the dispensed doses data
        vm.totalMgDispensed;
        vm.actualMgDispensed;
        vm.theoreticalCostOfDispensed; // This is totalMgDispensed * Cost
        vm.actualCostOfDispensed; // This is actualMgDispensed * cost
        vm.actualToListCostIndex; // actual / total
        vm.numberOfDosesDispensed = 0;


        vm.DispensedDataSetMetrics; // pulled from table A  - All tables have this same info
        //Total Waste mg & cost Total Waste  ADD total mg dispensed and number of doses dispensed


        // create object to house all of the form scope objects so that partials work
        vm.entryForm= {};



        
        vm.entryForm.analyzeData = function () {

            vm.showTables = true;

            // for the SBAR template
            vm.entryForm.medicationName;
            vm.sumMgDiscardedFromDispensing = vm.actualMgDispensed - vm.totalMgDispensed; // - actual dispensed - total dispensed
            vm.costOfDiscardedMedication = vm.sumMgDiscardedFromDispensing * vm.entryForm.costPerMg; // the cost in $  - actual dispensed - total dispensed



            //Validate the form
            
           

            // get array from the textareaBox dispensedDosesTextArea which is stored as a string
            var dispensedDosesStringArray = vm.entryForm.dispensedDosesTextArea.split(",");
            //parse data into numbers

            var dispensedDoses = [];
            var tempNum;
            for (var i = 0; i < dispensedDosesStringArray.length; i++) {

                dispensedDoses.push(parseFloat(dispensedDosesStringArray[i]));
                vm.numberOfDosesDispensed += 1;
            }
            ;

            //display what is entered into the form

            //alert("This is what was entered. Round Fraction:" + vm.roundFraction + " small Vial Size: " + vm.smallVialSize + " largeVialSize: " + vm.largeVialSize + "Cost Per Mg: " + vm.costPerMg + " max Dose Unit: " + vm.maxDoseUnit + " Dose Per Unit: " + vm.dosePerUnit + " Dispensed Dose Data: " + dispensedDoses);


            //create table for each round and assign to properties
            //Scope ng-model's
            //1. roundFraction
            //2. smallVialSize
            //3. largeVialSize
            //4. costPerMg
            //5. maxDoseUnit
            //6. dosePerUnit
            //7. vialsUsedTextArea
            
            
            

            vm.TableA = new tableFactory((vm.entryForm.roundPercent / 100), "a", vm.entryForm.smallVialSize, vm.entryForm.largeVialSize, vm.entryForm.maxDoseUnit, vm.entryForm.dosePerUnit, dispensedDoses, vm.entryForm.costPerMg);
            
            vm.allCombosTableA = vm.TableA.getAllCombos();
            vm.totalMgReducedByRoundA = vm.TableA.getTotalMgReducedByRounding();
            vm.totalSavingsRoundA = vm.TableA.getSavingsByRounding();
            vm.numDosesInTableA = vm.TableA.getNumDosesInRoundRange();




            vm.TableB = new tableFactory((vm.entryForm.roundPercent / 100), "b", vm.entryForm.smallVialSize, vm.entryForm.largeVialSize, vm.entryForm.maxDoseUnit, vm.entryForm.dosePerUnit, dispensedDoses, vm.entryForm.costPerMg);
            
            vm.allCombosTableB = vm.TableB.getAllCombos();
            vm.totalMgReducedByRoundB = vm.TableB.getTotalMgReducedByRounding();
            vm.totalSavingsRoundB = vm.TableB.getSavingsByRounding();
            vm.numDosesInTableB = vm.TableB.getNumDosesInRoundRange();


            vm.TableC = new tableFactory((vm.entryForm.roundPercent / 100), "c", vm.entryForm.smallVialSize, vm.entryForm.largeVialSize, vm.entryForm.maxDoseUnit, vm.entryForm.dosePerUnit, dispensedDoses, vm.entryForm.costPerMg);
           
            vm.allCombosTableC = vm.TableC.getAllCombos();
            vm.totalMgReducedByRoundC = vm.TableC.getTotalMgReducedByRounding();
            vm.totalSavingsRoundC = vm.TableC.getSavingsByRounding();
            vm.numDosesInTableC = vm.TableC.getNumDosesInRoundRange();
            vm.numDosesRoundedUpC = vm.TableC.getNumDosesRoundedUp();


            // Info for the dispensed doses dataset
            vm.totalMgDispensed = vm.TableA.getTotalMgOfAllDispensedDoses();
            vm.actualMgDispensed = vm.TableA.getTotalMgOfAllDispensedDoses() + vm.TableA.getTotalWasteMg();
            vm.theoreticalCostOfDispensed = vm.totalMgDispensed * vm.entryForm.costPerMg;
            vm.actualCostOfDispensed = vm.actualMgDispensed * vm.entryForm.costPerMg;
            vm.actualToListCostIndex = vm.actualCostOfDispensed / vm.theoreticalCostOfDispensed;

				
				};

    };


}());


