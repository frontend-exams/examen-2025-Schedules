import React, { useState, useEffect } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
import { showMessage } from 'react-native-flash-message'
import * as yup from 'yup'
import { Formik } from 'formik'
import TextError from '../../components/TextError'
import { getRestaurantSchedule, updateSchedule } from '../../api/RestaurantEndpoints' // No confundir con getRestaurantSchedules
import { buildInitialValues } from '../Helper'

export default function EditScheduleScreen ({ navigation, route }) {
  const [backendErrors, setBackendErrors] = useState() // Aquí si usamos los backendErrors para mostrarlos en el formulario
  const [initialScheduleValues, setInitialScheduleValues] = useState({ startTime: null, endTime: null })
  const [schedule, setSchedule] = useState({})
  const validationSchema = yup.object().shape({
    startTime: yup
      .string()
      .required('Start time is required')
      .matches(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, // Esto es un porro, menos mal que daban la pantalla creada
        'The time must be in the HH:mm (e.g. 14:30:00) format'
      ),
    endTime: yup
      .string()
      .required('End time is required')
      .matches(
        /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
        'The time must be in the HH:mm (e.g. 14:30:00) format'
      )
  })
  // Cuando estamos haciendo un Edit con un formulario debemos usar useEffect para cargar los valores iniciales
  useEffect(() => {
    async function fetchScheduleDetail () {
      try {
        const fetchedSchedule = await getRestaurantSchedule(route.params.restaurantId, route.params.id)
        setSchedule(fetchedSchedule)
        const initialValues = buildInitialValues(fetchedSchedule, initialScheduleValues)
        setInitialScheduleValues(initialValues)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving schedule details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchScheduleDetail()
  }, [route])
  const update = async (values) => {
    setBackendErrors([]) // Los inicializamos vacíos
    try {
      const updatedSchedule = await updateSchedule(schedule.restaurantId, schedule.id, values)
      showMessage({
        message: `Schedule ${updatedSchedule.startTime} - ${updatedSchedule.endTime} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      navigation.navigate('RestaurantDetailScreen', { id: schedule.restaurantId })
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors) // Los llenamos con error.errors si es que se han producido errores
    }
  }
  return (
    // NO PONER COMENTARIOS DENTRO DEL FORMIK QUE PETA
    <Formik
      enableReinitialize
      validationSchema={validationSchema}
      initialValues={initialScheduleValues}
      onSubmit={update}>
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem
                name='startTime'
                label='Start Time (HH:mm:ss):'
              />
              <InputItem
                name='endTime'
                label='End Time (HH:mm:ss):'
              />

              {backendErrors &&
                backendErrors.map((error, index) => <TextError key={index}>{error.param}-{error.msg}</TextError>)
              }

              <Pressable
                onPress={ handleSubmit }
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}>
                <View style={[{ flex: 1, flexDirection: 'row', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name='content-save' color={'white'} size={20}/>
                  <TextRegular textStyle={styles.text}>
                    Save
                  </TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5

  },
  imagePicker: {
    height: 40,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 80
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 5
  },
  switch: {
    marginTop: 5
  }
})
