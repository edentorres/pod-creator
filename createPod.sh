#!/bin/bash

if [ $# -eq 0 ]
  then
    echo "Need tag version! Ex: 2.2.9."
    echo "TIP : Specify branch with second argument (by default the branch is master)"
    exit 0
fi

VERSION="test_tag"
PROJECT="MercadoPagoSDK"
PODSPEC_FILE="$PROJECT.podspec"
PROJECT_PATH="tmp-px-ios"
## Default branch is master
GIT_BRANCH="master"

if [ "$#" -eq 2 ]
  then
  	GIT_BRANCH=$2

fi

cd $PROJECT_PATH
PATH_STATUS=$?
if [ $PATH_STATUS -ne 0 ]
	then
		echo "Could not find $PROJECT_PATH folder :("
		exit 0
fi

echo "=========================================="
echo "1) Validate .podspec --allow-warnings"
echo "=========================================="

pod lib lint --allow-warnings
STATUS=$?
if [ $STATUS -ne 0 ]
	then
		echo "Error ocurred. Validate podspec."
		exit 0
fi


echo "=========================================="
echo "2) Create tag for version $VERSION from $GIT_BRANCH branch"
echo "=========================================="

git checkout $GIT_BRANCH
git tag $VERSION
git push https://token@github.com/mercadopago/px-ios.git $VERSION
PUSH_STATUS=$?

if [ $PUSH_STATUS -ne 0 ]
	then
		echo "Error ocurred pushing tag."
		exit 0
fi


echo "=========================================="
echo "3) Push podspec into trunk/Specs"
echo "=========================================="
# pod trunk push $PODSPEC_FILE --allow-warnings --verbose
# POD_TRUNK_STATUS=$?

# if [ $POD_TRUNK_STATUS -ne 0 ]
# 	then
# 		echo "Error ocurred pushing pod into trunk."
# 		exit 0
# fi


echo "=========================================="
echo "		Pod created from tag $VERSION. 		"
echo " 			Versions available in 			"
echo "https://github.com/CocoaPods/Specs/tree/master/Specs/$PROJECT"
echo "=========================================="
