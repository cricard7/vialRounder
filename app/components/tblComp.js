(function () {
    // remember to update module name and controller name
    angular

        .module('myApp')
        .component('tblComp', {

        bindings: {
            filterState: '=',
            tblData: '=',
            numRoundUp: '@',
            tbl: '@'
        },
        
        controller: function(){
            
        // this is stateless, so no need for a controller
            console.log("?");
            
        },
        
        template: `
        
    <div class="row">
        <div class="col-lg-10 col-lg-offset-1">
            <table class="table table-striped table-bordered">
                <caption>Rounding Method {{$ctrl.tbl}}</caption>
                <tr class="custHover">
                    <!--Rounding Recommendation -->
                    <th>Rounded Dose (mg)</th>
                    <th>Lower Range (mg)</th>
                    <th>Upper Range (mg)</th>
                    <th ng-show="$ctrl.filterState=='Recommendation'">Positive Variance %</th>
                    <th ng-show="$ctrl.filterState=='Recommendation'">Negative Variance %</th>
                    <!--Diagnostic data -->
                    <th ng-show="$ctrl.filterState=='Diagnostic'">Number of Small Vials</th>
                    <th ng-show="$ctrl.filterState=='Diagnostic'">Number of Large Vials</th>
                    <th ng-show="$ctrl.filterState=='Diagnostic'">Number of Doses dispensed in Range</th>
                    <th ng-show="$ctrl.filterState=='Diagnostic'">m2OrKgLowerValue</th>
                    <th ng-show="$ctrl.filterState=='Diagnostic'">m2OrKgUpperValue</th>
                    <!-- Economic Data -->
                    <th ng-show="$ctrl.filterState=='Economic'">Dollar Saved By Round</th>
                    <th ng-show="$ctrl.filterState=='Economic'">Amount Total mg Reduced By Round Range</th>
                </tr>
                <tr class="custHover" ng-repeat="combo in $ctrl.tblData">
                    <!--Rounding Recommendation -->
                    <td>{{ combo.doseInMg }}</td>
                    <td>{{ combo.lowerRoundValue | number: 3}}</td>
                    <td> {{ combo.upperRoundValue | number: 3}}</td>
                    <td ng-show="$ctrl.filterState=='Recommendation'"> {{ combo.posVariance | number: 3 }}</td>
                    <td ng-show="$ctrl.filterState=='Recommendation'"> {{ combo.negVariance | number: 3}}</td>

                    <!--Diagnostic data -->
                    <td ng-show="$ctrl.filterState=='Diagnostic'">{{combo.numSVial}}</td>
                    <td ng-show="$ctrl.filterState=='Diagnostic'">{{combo.numLVial}}</td>
                    <td ng-show="$ctrl.filterState=='Diagnostic'">{{combo.numDoses}}</td>
                    <td ng-show="$ctrl.filterState=='Diagnostic'">{{combo.m2OrKgLowerValue | number: 3}}</td>
                    <td ng-show="$ctrl.filterState=='Diagnostic'">{{combo.m2OrKgUpperValue | number: 3}}</td>
                    <!--Economic Data -->
                    <td ng-show="$ctrl.filterState=='Economic'">{{combo.dollarsSavedByRound | currency}}</td>
                    <td ng-show="$ctrl.filterState=='Economic'">{{combo.amountTotalMgReducedByRound | number: 3}}</td>
                </tr>

 <tr ng-if="$ctrl.numRoundUp">
                    <td>Doses Rounded Up: {{$ctrl.numRoundUp}}</td>
                </tr>
            </table>
        </div>
    </div>

`

            }




        );


}());
