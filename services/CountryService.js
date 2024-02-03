import {Countries, Rules} from "../utils/Countries.js";

export default class CountryService {
    predict(countryCode) {
        const rule = Rules.hasOwnProperty(countryCode) ? Rules[countryCode] : Rules['default'];
        let result = [];
        let percentage = 0;
        for (const ruleItem of rule) {
            if (ruleItem.type === "current") {
                const prediction = this.randomPredict(countryCode, ruleItem.lowerBound, ruleItem.upperBound);
                percentage += prediction.prediction;
                result.push(prediction);
            } else if (ruleItem.type === "continent") {
                const randomItem = this.randomItem(ruleItem.value);
                const prediction = this.randomPredictByContinent(randomItem, ruleItem.lowerBound, ruleItem.upperBound);
                percentage += prediction.prediction;
                result.push(prediction);
            } else if (ruleItem.type === "country") {
                const randomItem = this.randomItem(ruleItem.value);
                const prediction = this.randomPredict(randomItem, ruleItem.lowerBound, ruleItem.upperBound);
                percentage += prediction.prediction;
                result.push(prediction);
            }
        }
        if (percentage !== 100) {
            let diff = 100 - percentage;
            for(let i=0; i < Math.abs(diff); i++) {
                const item = this.randomItem(result);
                if (diff > 0) {
                    item.prediction++;
                } else {
                    item.prediction--;
                }
            }
        }
        return result;
    }

    randomPredict(countryCode, lowerBound, upperBound) {
        const country = Countries.countries[countryCode]
        const randomPercentage = lowerBound + Math.round(Math.random() * (upperBound - lowerBound));

        return {
            code: countryCode, name: country.name, prediction: randomPercentage,
        }
    }

    randomPredictByContinent(continent, lowerBound, upperBound) {
        const countryCode = this.randomItem(Countries.continents[continent].countries);
        return this.randomPredict(countryCode, lowerBound, upperBound);
    }

    randomItem(array) {
        if (array.length === 1) {
            return array[0];
        }
        let index = Math.floor(Math.random() * array.length);
        return array[index];
    }
}
