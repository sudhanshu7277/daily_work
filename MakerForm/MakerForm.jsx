// MakerForm.js - Updated with Controller for DatePickers and Grid Layout
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Checkbox, FormControlLabel, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import api from '../../services/api';

const defaultValues = {
  securityNumber: '',
  eventType: '',
  eventValueDate: null,
  eventRecordDate: null,
  entitlement: '',
  paymentType: '',
  paymentMethod: '',
  paymentDate: null,
  paymentAmount: '',
  presenterPosition: '',
  standardPayment: false,
  target: false,
  creditPayment: false,
  fedwire: false,
  creditorEntity: '',
  creditorWord: '',
  creditorInformation: '',
};

const MakerForm = () => {
  const { register, handleSubmit, formState: { errors, isValid }, reset, setValue, control } = useForm({
    defaultValues,
    mode: 'onChange',
  });

  // Fetch data on mount to pre-populate if available (last entry)
  useEffect(() => {
    const fetchData = async () => {
      const data = await api.getData();
      if (data.length > 0) {
        const lastEntry = data[data.length - 1];
        Object.keys(lastEntry).forEach(key => {
          if (['eventValueDate', 'eventRecordDate', 'paymentDate'].includes(key)) {
            const dateStr = lastEntry[key];
            const date = dateStr ? dayjs(dateStr, 'MM-DD-YYYY') : null;
            // Ensure the dayjs object is valid before setting
            setValue(key, date && date.isValid() ? date : null);
          } else {
            setValue(key, lastEntry[key]);
          }
        });
      }
    };
    fetchData();
  }, [setValue]);

  const onSubmit = async (data) => {
    // Format dates to MM-DD-YYYY string
    const formattedData = {
      ...data,
      eventValueDate: data.eventValueDate ? dayjs(data.eventValueDate).format('MM-DD-YYYY') : '',
      eventRecordDate: data.eventRecordDate ? dayjs(data.eventRecordDate).format('MM-DD-YYYY') : '',
      paymentDate: data.paymentDate ? dayjs(data.paymentDate).format('MM-DD-YYYY') : '',
    };
    console.log('Submitted data:', formattedData);
    await api.postData(formattedData);
    reset(defaultValues);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '1200px', margin: '50px auto 0' }}
      >
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.securityNumber ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Security Number
          </label>
          <TextField
            {...register('securityNumber', { required: 'Required' })}
            error={!!errors.securityNumber}
            helperText={errors.securityNumber?.message}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.eventType ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Event Type
          </label>
          <TextField
            {...register('eventType', { required: 'Required' })}
            error={!!errors.eventType}
            helperText={errors.eventType?.message}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.eventValueDate ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Event Value Date
          </label>
          <Controller
            name="eventValueDate"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <DatePicker
                {...field}
                label=""
                format="MM-DD-YYYY"
                slotProps={{
                  textField: {
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.eventRecordDate ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Event Record Date
          </label>
          <Controller
            name="eventRecordDate"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <DatePicker
                {...field}
                label=""
                format="MM-DD-YYYY"
                slotProps={{
                  textField: {
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.entitlement ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Entitlement
          </label>
          <TextField
            {...register('entitlement', { required: 'Required' })}
            error={!!errors.entitlement}
            helperText={errors.entitlement?.message}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.paymentType ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Payment Type
          </label>
          <TextField
            {...register('paymentType', { required: 'Required' })}
            error={!!errors.paymentType}
            helperText={errors.paymentType?.message}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.paymentMethod ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Payment Method
          </label>
          <TextField
            {...register('paymentMethod', { required: 'Required' })}
            error={!!errors.paymentMethod}
            helperText={errors.paymentMethod?.message}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.paymentDate ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Payment Date
          </label>
          <Controller
            name="paymentDate"
            control={control}
            rules={{ required: 'Required' }}
            render={({ field, fieldState }) => (
              <DatePicker
                {...field}
                label=""
                format="MM-DD-YYYY"
                slotProps={{
                  textField: {
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.paymentAmount ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Payment Amount
          </label>
          <TextField
            type="number"
            {...register('paymentAmount', { required: 'Required' })}
            error={!!errors.paymentAmount}
            helperText={errors.paymentAmount?.message}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.presenterPosition ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Presenter Position
          </label>
          <TextField
            {...register('presenterPosition', { required: 'Required' })}
            error={!!errors.presenterPosition}
            helperText={errors.presenterPosition?.message}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.creditorEntity ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Creditor Entity
          </label>
          <TextField
            {...register('creditorEntity', { required: 'Required' })}
            error={!!errors.creditorEntity}
            helperText={errors.creditorEntity?.message}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.875rem', color: errors.creditorWord ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Creditor Word
          </label>
          <TextField
            {...register('creditorWord', { required: 'Required' })}
            error={!!errors.creditorWord}
            helperText={errors.creditorWord?.message}
          />
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <label style={{ fontSize: '0.875rem', color: errors.creditorInformation ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
            Creditor Information
          </label>
          <TextField
            {...register('creditorInformation', { required: 'Required' })}
            error={!!errors.creditorInformation}
            helperText={errors.creditorInformation?.message}
          />
        </div>
        <div style={{ gridColumn: 'span 4', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <FormControlLabel
            control={<Checkbox {...register('standardPayment')} />}
            label="Standard Payment"
          />
          <FormControlLabel
            control={<Checkbox {...register('target')} />}
            label="Target"
          />
          <FormControlLabel
            control={<Checkbox {...register('creditPayment')} />}
            label="Credit Payment"
          />
          <FormControlLabel
            control={<Checkbox {...register('fedwire')} />}
            label="Fedwire"
          />
        </div>
        <div style={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'center' }}>
          <Button type="submit" variant="contained" size="small" disabled={!isValid}>
            Submit
          </Button>
        </div>
      </form>
    </LocalizationProvider>
  );
};

export default MakerForm;












// // MakerForm.js - Updated with Controller for DatePickers and Grid Layout
// import React, { useEffect } from 'react';
// import { useForm, Controller } from 'react-hook-form';
// import { TextField, Checkbox, FormControlLabel, Button } from '@mui/material';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import dayjs from 'dayjs';
// import api from '../../services/api';

// const defaultValues = {
//   securityNumber: '',
//   eventType: '',
//   eventValueDate: null,
//   eventRecordDate: null,
//   entitlement: '',
//   paymentType: '',
//   paymentMethod: '',
//   paymentDate: null,
//   paymentAmount: '',
//   presenterPosition: '',
//   standardPayment: false,
//   target: false,
//   creditPayment: false,
//   fedwire: false,
//   creditorEntity: '',
//   creditorWord: '',
//   creditorInformation: '',
// };

// const MakerForm = () => {
//   const { register, handleSubmit, formState: { errors, isValid }, reset, setValue, control } = useForm({
//     defaultValues,
//     mode: 'onChange',
//   });

//   // Fetch data on mount to pre-populate if available (last entry)
//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await api.getData();
//       if (data.length > 0) {
//         const lastEntry = data[data.length - 1];
//         Object.keys(lastEntry).forEach(key => {
//           if (['eventValueDate', 'eventRecordDate', 'paymentDate'].includes(key)) {
//             const dateStr = lastEntry[key];
//             const date = dateStr ? dayjs(dateStr, 'MM-DD-YYYY') : null;
//             setValue(key, date);
//           } else {
//             setValue(key, lastEntry[key]);
//           }
//         });
//       }
//     };
//     fetchData();
//   }, [setValue]);

//   const onSubmit = async (data) => {
//     // Format dates to MM-DD-YYYY string
//     const formattedData = {
//       ...data,
//       eventValueDate: data.eventValueDate ? dayjs(data.eventValueDate).format('MM-DD-YYYY') : '',
//       eventRecordDate: data.eventRecordDate ? dayjs(data.eventRecordDate).format('MM-DD-YYYY') : '',
//       paymentDate: data.paymentDate ? dayjs(data.paymentDate).format('MM-DD-YYYY') : '',
//     };
//     console.log('Submitted data:', formattedData);
//     await api.postData(formattedData);
//     reset(defaultValues);
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <form 
//         onSubmit={handleSubmit(onSubmit)} 
//         style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', maxWidth: '1200px', margin: '50px auto 0' }}
//       >
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.securityNumber ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Security Number
//           </label>
//           <TextField
//             {...register('securityNumber', { required: 'Required' })}
//             error={!!errors.securityNumber}
//             helperText={errors.securityNumber?.message}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.eventType ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Event Type
//           </label>
//           <TextField
//             {...register('eventType', { required: 'Required' })}
//             error={!!errors.eventType}
//             helperText={errors.eventType?.message}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.eventValueDate ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Event Value Date
//           </label>
//           <Controller
//             name="eventValueDate"
//             control={control}
//             rules={{ required: 'Required' }}
//             render={({ field, fieldState }) => (
//               <DatePicker
//                 {...field}
//                 label=""
//                 format="MM-DD-YYYY"
//                 slotProps={{
//                   textField: {
//                     error: !!fieldState.error,
//                     helperText: fieldState.error?.message,
//                   },
//                 }}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.eventRecordDate ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Event Record Date
//           </label>
//           <Controller
//             name="eventRecordDate"
//             control={control}
//             rules={{ required: 'Required' }}
//             render={({ field, fieldState }) => (
//               <DatePicker
//                 {...field}
//                 label=""
//                 format="MM-DD-YYYY"
//                 slotProps={{
//                   textField: {
//                     error: !!fieldState.error,
//                     helperText: fieldState.error?.message,
//                   },
//                 }}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.entitlement ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Entitlement
//           </label>
//           <TextField
//             {...register('entitlement', { required: 'Required' })}
//             error={!!errors.entitlement}
//             helperText={errors.entitlement?.message}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.paymentType ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Payment Type
//           </label>
//           <TextField
//             {...register('paymentType', { required: 'Required' })}
//             error={!!errors.paymentType}
//             helperText={errors.paymentType?.message}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.paymentMethod ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Payment Method
//           </label>
//           <TextField
//             {...register('paymentMethod', { required: 'Required' })}
//             error={!!errors.paymentMethod}
//             helperText={errors.paymentMethod?.message}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.paymentDate ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Payment Date
//           </label>
//           <Controller
//             name="paymentDate"
//             control={control}
//             rules={{ required: 'Required' }}
//             render={({ field, fieldState }) => (
//               <DatePicker
//                 {...field}
//                 label=""
//                 format="MM-DD-YYYY"
//                 slotProps={{
//                   textField: {
//                     error: !!fieldState.error,
//                     helperText: fieldState.error?.message,
//                   },
//                 }}
//               />
//             )}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.paymentAmount ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Payment Amount
//           </label>
//           <TextField
//             type="number"
//             {...register('paymentAmount', { required: 'Required' })}
//             error={!!errors.paymentAmount}
//             helperText={errors.paymentAmount?.message}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.presenterPosition ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Presenter Position
//           </label>
//           <TextField
//             {...register('presenterPosition', { required: 'Required' })}
//             error={!!errors.presenterPosition}
//             helperText={errors.presenterPosition?.message}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.creditorEntity ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Creditor Entity
//           </label>
//           <TextField
//             {...register('creditorEntity', { required: 'Required' })}
//             error={!!errors.creditorEntity}
//             helperText={errors.creditorEntity?.message}
//           />
//         </div>
//         <div>
//           <label style={{ fontSize: '0.875rem', color: errors.creditorWord ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Creditor Word
//           </label>
//           <TextField
//             {...register('creditorWord', { required: 'Required' })}
//             error={!!errors.creditorWord}
//             helperText={errors.creditorWord?.message}
//           />
//         </div>
//         <div style={{ gridColumn: 'span 4' }}>
//           <label style={{ fontSize: '0.875rem', color: errors.creditorInformation ? '#d32f2f' : 'rgba(0, 0, 0, 0.6)', marginBottom: '8px', display: 'block' }}>
//             Creditor Information
//           </label>
//           <TextField
//             {...register('creditorInformation', { required: 'Required' })}
//             error={!!errors.creditorInformation}
//             helperText={errors.creditorInformation?.message}
//           />
//         </div>
//         <div style={{ gridColumn: 'span 4', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
//           <FormControlLabel
//             control={<Checkbox {...register('standardPayment')} />}
//             label="Standard Payment"
//           />
//           <FormControlLabel
//             control={<Checkbox {...register('target')} />}
//             label="Target"
//           />
//           <FormControlLabel
//             control={<Checkbox {...register('creditPayment')} />}
//             label="Credit Payment"
//           />
//           <FormControlLabel
//             control={<Checkbox {...register('fedwire')} />}
//             label="Fedwire"
//           />
//         </div>
//         <div style={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'center' }}>
//           <Button type="submit" variant="contained" size="small" disabled={!isValid}>
//             Submit
//           </Button>
//         </div>
//       </form>
//     </LocalizationProvider>
//   );
// };

// export default MakerForm;


