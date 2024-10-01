package statisticcalculator;

import java.util.Arrays;
import java.util.Scanner;

/**
 *
 * @author ryanc
 */
public class StatisticCalculator {

    /**
     * @param args the command line arguments
     */
    static final int MAX_SIZE = 100;
    static int size = 0;
    static double [] numArray = new double[MAX_SIZE];
    
    
    public static double askDouble(String question) {
        Scanner kbReader = new Scanner(System.in);
        System.out.print(question + " ");
        try {
            double answer = kbReader.nextDouble();
            return answer;
        }
        catch (Exception e) {
            return askDouble(question);
        }
    }

    
    public static void main(String[] args) {
        System.out.println("Statistics Calculator");
        int choice;
        do {
            choice = showChoices();
            actOn(choice);
        } while (choice != 0);
        System.out.println("Goodbye!");
    }
    public static int showChoices() {
        System.out.println("1. Insert new number");
        System.out.println("2. Remove last number");
        System.out.println("3. Print raw array of numbers");
        System.out.println("4. Print sorted array of numbers");
        System.out.println("5. Calculate the mean");
        System.out.println("6. Calculate the median");
        System.out.println("7. Calculate the maximum and minimum");
        System.out.println("8. Calculate the mean deviation");
        System.out.println("9. Calculate the standard deviation");
        System.out.println("0. Quit");
        int choice = (int)askDouble("Enter selection:");
        return choice;
    }
    public static void actOn(int choice) {
        switch (choice) {
            case 1: add(); break;
            case 2: remove(); break;
            case 3: printRawArray(); break;
            case 4: printSortedArray(); break;
            case 5: mean(); break;
            case 6: median(); break;
            case 7: maxAndMin(); break;
            case 8: System.out.println("\n"); break;
            case 9: sDeviation(); break;
            case 0: break; 
            default: System.out.println("\n"); showChoices(); break;
        }
    }
    public static void add() {
        
        if (size < MAX_SIZE) {
            double arrayNum = askDouble("Enter number:");
            numArray[size] = arrayNum;
            size++;
        }
        else {
            System.out.println("Exceeds maximum number limit.");
        }
        System.out.println("\n");
    }
    public static void remove() {
        if (size > 0) {
            size -= 1;
        }
        
        System.out.println("\n");
    }
    public static void printRawArray() {
        System.out.print("Raw list:");
        for (int k = 0; k < size; k++) {
            System.out.print(" " + numArray[k]);
        }
        System.out.println("\n");
    }
    public static void mean() {
        double sum = 0;
        for (int k = 0; k < size; k++) {
            sum += numArray[k];
        }
        double mean = Math.round((sum / size) * 100) / 100.00;
        System.out.println("Mean: " + mean);
        System.out.println("\n");
    }
    public static void printSortedArray() {
        double sortedArray[] = Arrays.copyOf(numArray, size);
        Arrays.sort(sortedArray);
        System.out.print("Sorted list:");
        for (int k = 0; k < sortedArray.length; k++) {
            System.out.print(" " + sortedArray[k]);
        }
        System.out.println("\n");
    }
    public static void maxAndMin() {
        double sortedArray[] = Arrays.copyOf(numArray, size);
        Arrays.sort(sortedArray);
        System.out.print("Maximum: " + sortedArray[size-1] + ", ");
        System.out.print("Minimum: " + sortedArray[0]);
        System.out.println("\n");
    }
    public static void median() {
        double sortedArray[] = Arrays.copyOf(numArray, size);
        Arrays.sort(sortedArray);
        if (size % 2 != 0) {
            System.out.println("Median: " + sortedArray[size/2]);
        }
        else {
            double midNum1 = sortedArray[size/2];
            double midNum2 = sortedArray[(size/2)-1];
            double median = Math.round(((midNum1 + midNum2)/2) * 100) / 100.00;
            System.out.println("Median: " + median);
            
        }
        System.out.println("\n");
    }
    public static void sDeviation() {
        double sum = 0;
        for (int k = 0; k < size; k++) {
            sum += numArray[k];
        }
        double mean = sum / size;
        double dSum = 0;
        for (int k = 0; k < size; k++) {
            double difference = Math.round(Math.pow((numArray[k] - mean), 2) * 100) / 100.00;
            dSum += difference;
        }
        double sDeviation = Math.round((Math.sqrt(dSum / (size - 1))) * 100) / 100.00;
        System.out.println("Standard deviation: " + sDeviation);
    }
    
}
