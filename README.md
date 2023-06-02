# WikiGenerator

Article generator with Google sheets API and OpenAI API

# How to configure it  

1. Configure de env config file so you put your excel ID in the variable EXCEL_ID For example if you open your excel file on google drive and you have this url https://docs.google.com/spreadsheets/d/1hLDlENMuyH2bwlNzPkC6O7ypHYVJoQVAUBPf25yKAbU/edit#gid=0 You should take this part 1hLDlENMuyH2bwlNzPkC6O7ypHYVJoQVAUBPf25yKAbU that is what is going to be your file ID.
2. Give edit permisions to this google account googlesheets@triple-visitor-388407.iam.gserviceaccount.com so it can edit the file in google drive
3. Make sure that you have the right structure in the excel file: 

![image](https://github.com/Mcanteros2021/WikiGenerator/assets/90841463/3ea9375d-23a7-4771-8e94-a44c9a9bb1c7)

You can put any amount of keywords in the first column so when you execute the program it will fill with the content all the cells.

# How to use it after the configuration 

1. First make sure to run npm install to install all the dependencies, make sure you have node installed
2. Execute the file main.js with node, use the command node main.js
3. It will show you in the console an Array List of the keywords in the column and then start creating the content.
4. Wait to all the process to finish, due to the token restriction from the OpenAI API it will takes you a lot of time to process all the information.
